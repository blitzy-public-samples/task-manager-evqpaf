# Required Providers:
# - hashicorp/terraform v1.5.0
# - hashicorp/aws v5.0.0

# This file addresses the following requirements from Technical Specification/2.2 Component Details/Data Storage Components:
# - Infrastructure as Code: Implements input variables for the RDS module to allow flexible 
#   and reusable configurations for PostgreSQL database instances.

# Human Tasks:
# 1. Ensure subnet group is created and available before using this module
# 2. Configure security groups with appropriate ingress/egress rules before referencing them
# 3. Verify that the chosen instance class (db.t3.micro by default) meets production performance requirements

variable "db_instance_class" {
  description = "The instance class for the RDS instance."
  type        = string
  default     = "db.t3.micro"

  validation {
    condition     = can(regex("^db\\.", var.db_instance_class))
    error_message = "The db_instance_class value must start with 'db.' prefix."
  }
}

variable "allocated_storage" {
  description = "The allocated storage size in GB for the RDS instance."
  type        = number
  default     = 20

  validation {
    condition     = var.allocated_storage >= 20 && var.allocated_storage <= 65536
    error_message = "Allocated storage must be between 20 GB and 65536 GB."
  }
}

variable "backup_retention_period" {
  description = "The number of days to retain backups for the RDS instance."
  type        = number
  default     = 7

  validation {
    condition     = var.backup_retention_period >= 0 && var.backup_retention_period <= 35
    error_message = "Backup retention period must be between 0 and 35 days."
  }
}

variable "security_group_ids" {
  description = "A list of security group IDs to associate with the RDS instance."
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for sg in var.security_group_ids : can(regex("^sg-", sg))])
    error_message = "All security group IDs must start with 'sg-' prefix."
  }
}

variable "subnet_group_name" {
  description = "The name of the DB subnet group to use for the RDS instance."
  type        = string
  default     = ""

  validation {
    condition     = var.subnet_group_name == "" || can(regex("^[a-zA-Z]", var.subnet_group_name))
    error_message = "Subnet group name must start with a letter and can contain only alphanumeric characters and hyphens."
  }
}