# AWS Provider version: 5.0.0

# This file defines input variables for the S3 module to enable parameterization
# and reusability of the S3 bucket configuration.

# Requirement addressed: Scalable Cloud Infrastructure
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Provides input variables for configuring the S3 bucket to ensure 
# scalable and customizable file storage.

variable "bucket_name" {
  description = "The name of the S3 bucket."
  type        = string
  
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.bucket_name))
    error_message = "The bucket name must be between 3 and 63 characters long, contain only lowercase letters, numbers, dots, and hyphens. It must start and end with a letter or number."
  }
}

variable "versioning" {
  description = "Enable or disable versioning for the S3 bucket."
  type        = bool
  default     = false
}

variable "environment" {
  description = "The environment for the S3 bucket (e.g., development, staging, production)."
  type        = string
  default     = "development"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "The environment must be one of: development, staging, production."
  }
}

# List of human tasks:
# 1. Ensure AWS credentials are properly configured in the environment
# 2. Verify that the bucket name follows AWS S3 naming conventions and is globally unique
# 3. Consider the implications of enabling versioning on storage costs and lifecycle management
# 4. Review environment-specific requirements and adjust default values if needed