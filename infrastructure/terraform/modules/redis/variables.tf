# AWS Provider version: 5.0.0
# Terraform version: 1.5.0

# This file defines input variables for the Redis module to enable parameterization
# of the Redis Elasticache cluster configuration.

# Requirement addressed: Cache Layer
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Provides input variables to configure the Redis Elasticache cluster for caching purposes.

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/4.5 Development & Deployment/Infrastructure Requirements
# Description: Using Terraform to manage and provision Redis resources in a scalable and repeatable manner.

variable "cluster_id" {
  description = "The identifier for the Redis cluster."
  type        = string
  default     = "redis-cluster"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*[a-z0-9]$", var.cluster_id))
    error_message = "The cluster ID must start with a letter, can contain letters, numbers, and hyphens, and must end with a letter or number."
  }
}

variable "node_type" {
  description = "The instance type for the Redis nodes."
  type        = string
  default     = "cache.t3.medium"

  validation {
    condition     = can(regex("^cache\\.[a-z0-9]+\\.[a-z0-9]+$", var.node_type))
    error_message = "The node type must be a valid Redis node type (e.g., cache.t3.medium)."
  }
}

variable "num_cache_nodes" {
  description = "The number of cache nodes in the Redis cluster."
  type        = number
  default     = 1

  validation {
    condition     = var.num_cache_nodes > 0 && var.num_cache_nodes <= 6
    error_message = "The number of cache nodes must be between 1 and 6."
  }
}

variable "parameter_group_name" {
  description = "The name of the parameter group for the Redis cluster."
  type        = string
  default     = "default.redis6.x"

  validation {
    condition     = can(regex("^[a-zA-Z0-9-\\.]+$", var.parameter_group_name))
    error_message = "The parameter group name can only contain letters, numbers, hyphens, and periods."
  }
}

variable "subnet_group_name" {
  description = "The name of the subnet group for the Redis cluster."
  type        = string
  default     = "redis-subnet-group"

  validation {
    condition     = can(regex("^[a-zA-Z0-9-]+$", var.subnet_group_name))
    error_message = "The subnet group name can only contain letters, numbers, and hyphens."
  }
}

variable "security_group_ids" {
  description = "The security group IDs for the Redis cluster."
  type        = list(string)
  default     = ["sg-12345678"]

  validation {
    condition     = length(var.security_group_ids) > 0
    error_message = "At least one security group ID must be provided."
  }

  validation {
    condition     = alltrue([for sg in var.security_group_ids : can(regex("^sg-[a-f0-9]+$", sg))])
    error_message = "All security group IDs must be valid AWS security group IDs (starting with 'sg-')."
  }
}

variable "engine" {
  description = "The database engine for the Redis cluster."
  type        = string
  default     = "redis"

  validation {
    condition     = var.engine == "redis"
    error_message = "The engine must be 'redis'."
  }
}

variable "engine_version" {
  description = "The version of the Redis engine."
  type        = string
  default     = "6.x"

  validation {
    condition     = can(regex("^[0-9]+\\.[x0-9]+$", var.engine_version))
    error_message = "The engine version must be a valid Redis version (e.g., 6.x)."
  }
}

variable "port" {
  description = "The port number for the Redis cluster."
  type        = number
  default     = 6379

  validation {
    condition     = var.port >= 1024 && var.port <= 65535
    error_message = "The port number must be between 1024 and 65535."
  }
}

# List of human tasks:
# 1. Review and adjust the default node type based on your performance requirements
# 2. Verify that the security group IDs are correctly configured for your VPC
# 3. Consider if the number of cache nodes needs to be adjusted for high availability
# 4. Review the Redis engine version and ensure it meets your application requirements
# 5. Verify that the parameter group name matches your Redis configuration needs
# 6. Ensure the subnet group name aligns with your VPC configuration
# 7. Consider if the default port number needs to be changed based on your network setup
# 8. Review validation rules and adjust if necessary for your use case