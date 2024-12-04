# Terraform version: 1.5.0
# AWS Provider version: 5.0.0

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Provides input variables for parameterizing the Terraform configuration 
# to manage cloud resources such as Kubernetes, databases, caching, and storage.

# List of human tasks:
# 1. Review and adjust default values based on environment-specific requirements
# 2. Ensure AWS region aligns with compliance and latency requirements
# 3. Validate CIDR ranges don't conflict with existing networks
# 4. Review instance types match performance and cost requirements
# 5. Verify S3 bucket name follows naming conventions and is globally unique
# 6. Consider adding additional variables for tags and resource naming conventions

# AWS Region Configuration
variable "region" {
  description = "The AWS region where resources will be deployed."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.region))
    error_message = "The region must be a valid AWS region format (e.g., us-east-1, eu-west-1)."
  }
}

# Environment Configuration
variable "environment" {
  description = "The environment for the infrastructure (e.g., development, staging, production)."
  type        = string
  default     = "development"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

# VPC Configuration
variable "vpc_cidr" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

# EKS Configuration
variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
  default     = "task-management-cluster"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.eks_cluster_name))
    error_message = "EKS cluster name must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

# RDS Configuration
variable "db_instance_class" {
  description = "The instance class for the RDS database."
  type        = string
  default     = "db.t3.medium"

  validation {
    condition     = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.db_instance_class))
    error_message = "DB instance class must be a valid RDS instance type (e.g., db.t3.medium)."
  }
}

# Redis Configuration
variable "redis_node_type" {
  description = "The node type for the Redis cache."
  type        = string
  default     = "cache.t3.medium"

  validation {
    condition     = can(regex("^cache\\.[a-z0-9]+\\.[a-z0-9]+$", var.redis_node_type))
    error_message = "Redis node type must be a valid ElastiCache node type (e.g., cache.t3.medium)."
  }
}

# S3 Configuration
variable "s3_bucket_name" {
  description = "The name of the S3 bucket for file storage."
  type        = string
  default     = "task-management-bucket"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.s3_bucket_name)) && length(var.s3_bucket_name) >= 3 && length(var.s3_bucket_name) <= 63
    error_message = "S3 bucket name must be between 3 and 63 characters, contain only lowercase letters, numbers, dots, and hyphens, and start/end with a letter or number."
  }
}