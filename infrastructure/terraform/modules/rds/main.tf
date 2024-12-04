# AWS Provider version: 5.0.0
# Terraform version: 1.5.0

# This file addresses the following requirements from Technical Specification/2.2 Component Details/Data Storage Components:
# - Infrastructure as Code: Implements the RDS module to provision and manage PostgreSQL database instances 
#   with parameterized configurations.

# Human Tasks:
# 1. Review and update the password management strategy - consider using AWS Secrets Manager
# 2. Verify that the chosen PostgreSQL version (14.5) meets application requirements
# 3. Consider enabling encryption at rest if required for your use case
# 4. Review and adjust performance parameters based on workload requirements
# 5. Consider implementing Multi-AZ deployment for high availability
# 6. Set up CloudWatch alarms for monitoring database metrics
# 7. Verify backup and maintenance windows align with operational requirements
# 8. Consider implementing parameter groups for database engine configuration
# 9. Review network security and ensure proper VPC configuration
# 10. Plan for database scaling and storage requirements

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Define the main RDS instance
resource "aws_db_instance" "main" {
  identifier = "task-management-db"
  
  # Engine configuration
  engine         = "postgres"
  engine_version = "14.5"
  
  # Instance configuration
  instance_class    = var.db_instance_class
  allocated_storage = var.allocated_storage
  
  # Network configuration
  vpc_security_group_ids = var.security_group_ids
  db_subnet_group_name   = var.subnet_group_name
  
  # Authentication
  username = "admin"
  password = "securepassword" # TODO: Replace with secure password management solution
  
  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"
  
  # Performance and monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring_role.arn
  
  # Storage configuration
  storage_type          = "gp3"
  storage_encrypted     = true
  max_allocated_storage = 1000 # Enables storage autoscaling up to 1TB
  
  # Deletion protection
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "task-management-db-final-snapshot"
  
  # Enhanced monitoring
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  
  # Database parameters
  parameter_group_name = aws_db_parameter_group.main.name
  
  tags = {
    Name        = "task-management-db"
    Environment = "production"
    Terraform   = "true"
  }
}

# Create a custom parameter group for PostgreSQL
resource "aws_db_parameter_group" "main" {
  family = "postgres14"
  name   = "task-management-custom-params"

  parameter {
    name  = "max_connections"
    value = "1000"
  }

  parameter {
    name  = "shared_buffers"
    value = "{DBInstanceClassMemory/4096}"
  }

  tags = {
    Name        = "task-management-db-params"
    Environment = "production"
  }
}

# Create IAM role for enhanced monitoring
resource "aws_iam_role" "rds_monitoring_role" {
  name = "rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

# Attach the enhanced monitoring policy to the IAM role
resource "aws_iam_role_policy_attachment" "rds_monitoring_policy" {
  role       = aws_iam_role.rds_monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}