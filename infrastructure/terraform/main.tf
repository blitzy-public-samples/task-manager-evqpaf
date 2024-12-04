# Terraform version: 1.5.0
# AWS Provider version: 5.0.0

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Implements the main Terraform configuration to manage cloud resources 
# such as Kubernetes, databases, caching, and storage.

# List of human tasks:
# 1. Review and adjust VPC CIDR ranges based on network requirements
# 2. Configure RDS password through secure parameter store or secrets manager
# 3. Verify EKS cluster configuration meets security and scaling requirements
# 4. Ensure S3 bucket name is globally unique
# 5. Review and adjust resource tags for proper resource management
# 6. Validate subnet configurations for high availability
# 7. Configure backup retention periods for RDS and ElastiCache
# 8. Review security group rules for least privilege access

# Network Configuration
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "private"
  }
}

resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 3)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "public"
  }
}

# EKS Cluster Configuration
resource "aws_eks_cluster" "main" {
  name     = var.eks_cluster_name
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = {
    Name        = var.eks_cluster_name
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# RDS Instance Configuration
resource "aws_db_instance" "main" {
  identifier        = "task-management-${var.environment}"
  engine            = "postgres"
  engine_version    = "14.7"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = "task_management"
  username = "admin"
  password = "securepassword" # Should be managed through AWS Secrets Manager

  multi_az               = var.environment == "production" ? true : false
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  skip_final_snapshot = var.environment != "production"

  tags = {
    Name        = "task-management-${var.environment}-rds"
    Environment = var.environment
  }
}

# ElastiCache (Redis) Configuration
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "task-management-${var.environment}"
  engine              = "redis"
  node_type           = var.redis_node_type
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  port                = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  maintenance_window = "sun:05:00-sun:06:00"
  snapshot_window   = "04:00-05:00"

  tags = {
    Name        = "task-management-${var.environment}-redis"
    Environment = var.environment
  }
}

# S3 Bucket Configuration
resource "aws_s3_bucket" "main" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = var.s3_bucket_name
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Security Groups
resource "aws_security_group" "rds" {
  name_prefix = "rds-${var.environment}-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_eks_cluster.main.vpc_config[0].cluster_security_group_id]
  }

  tags = {
    Name        = "rds-${var.environment}-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "redis-${var.environment}-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_eks_cluster.main.vpc_config[0].cluster_security_group_id]
  }

  tags = {
    Name        = "redis-${var.environment}-sg"
    Environment = var.environment
  }
}

# Subnet Groups
resource "aws_db_subnet_group" "main" {
  name       = "task-management-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "task-management-${var.environment}-db-subnet"
    Environment = var.environment
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "task-management-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "task-management-${var.environment}-cache-subnet"
    Environment = var.environment
  }
}

# IAM Roles
resource "aws_iam_role" "eks_cluster" {
  name = "eks-cluster-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "eks-cluster-${var.environment}-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# Data Sources
data "aws_availability_zones" "available" {
  state = "available"
}