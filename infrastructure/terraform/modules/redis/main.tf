# AWS Provider version: 5.0.0
# Terraform version: 1.5.0

# This file defines the main configuration for provisioning and managing a Redis (Elasticache) 
# cluster with its associated networking and security configurations.

# Requirement addressed: Cache Layer
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Implements Redis module to provision and manage Elasticache clusters for caching purposes.

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/4.5 Development & Deployment/Infrastructure Requirements
# Description: Using Terraform to manage and provision Redis resources in a scalable manner.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Define the Redis subnet group for network placement
resource "aws_elasticache_subnet_group" "main" {
  name        = "redis-subnet-group"
  subnet_ids  = ["subnet-12345678", "subnet-87654321"]
  
  tags = {
    Name = "RedisSubnetGroup"
  }
}

# Define the Redis cluster configuration
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "redis-cluster"
  engine              = "redis"
  engine_version      = "6.x"
  node_type           = "cache.t3.medium"
  num_cache_nodes     = 1
  parameter_group_name = "default.redis6.x"
  port                = 6379
  
  # Network configuration
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = ["sg-12345678"]
  
  # Backup and maintenance configuration
  maintenance_window          = "sun:05:00-sun:06:00"
  snapshot_retention_limit    = 7
  snapshot_window            = "04:00-05:00"
  
  # Advanced settings
  auto_minor_version_upgrade = true
  notification_topic_arn     = null  # Optional: SNS topic for notifications
  
  tags = {
    Name = "RedisCluster"
  }
}

# Output the cluster endpoint for other modules to consume
output "redis_endpoint" {
  description = "The endpoint of the Redis cluster"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

# Output the cluster port for other modules to consume
output "redis_port" {
  description = "The port number of the Redis cluster"
  value       = aws_elasticache_cluster.main.port
}

# List of human tasks:
# 1. Verify and update the subnet IDs based on your VPC configuration
# 2. Review and update the security group ID based on your security requirements
# 3. Adjust the maintenance window and snapshot timing based on your operational requirements
# 4. Consider enabling encryption at rest if required for your use case
# 5. Review and adjust the node type based on your performance requirements
# 6. Consider setting up CloudWatch alarms for monitoring
# 7. Verify backup retention period meets your data recovery requirements
# 8. Consider implementing Multi-AZ if high availability is required
# 9. Review Redis version and parameter group settings based on application needs
# 10. Consider setting up SNS notifications for cluster events