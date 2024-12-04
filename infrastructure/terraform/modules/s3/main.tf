# AWS Provider version: 5.0.0

# This file defines the main configuration for the S3 module, including the creation
# and management of an S3 bucket with configurable properties.

# Requirement addressed: Scalable Cloud Infrastructure
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Implements the main configuration for the S3 module to ensure 
# scalable and customizable file storage.

terraform {
  # Specify required provider and minimum versions
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Create the S3 bucket with specified configuration
resource "aws_s3_bucket" "s3_bucket" {
  bucket = var.bucket_name

  # Configure versioning settings
  versioning {
    enabled = var.versioning
  }

  # Apply environment tags
  tags = {
    Environment = var.environment
  }

  # Enable server-side encryption by default
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  # Block public access by default for security
  block_public_access_settings {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

  # Enable bucket logging
  logging {
    target_bucket = var.bucket_name
    target_prefix = "logs/"
  }

  # Enable lifecycle rules for better management
  lifecycle_rule {
    id      = "cleanup"
    enabled = true

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    noncurrent_version_transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      days = 90
    }
  }
}

# List of human tasks:
# 1. Verify AWS credentials and permissions are properly configured
# 2. Review and adjust the lifecycle rules based on specific data retention requirements
# 3. Configure bucket logging destination if needed (currently set to self-logging)
# 4. Review encryption requirements and adjust if a specific KMS key is needed
# 5. Consider implementing additional security measures such as bucket policies
# 6. Evaluate the need for CORS configuration based on application requirements
# 7. Consider implementing replication for disaster recovery if needed