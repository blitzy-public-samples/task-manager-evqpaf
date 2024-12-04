# Terraform AWS Provider version: 5.0.0
# Terraform version: 1.5.0

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Defines the providers required for managing cloud resources such as Kubernetes, databases, caching, and storage.

# List of human tasks:
# 1. Verify AWS credentials are properly configured in the environment
# 2. Ensure the specified AWS region matches your deployment requirements
# 3. Confirm the AWS profile has necessary permissions for resource creation
# 4. Review and adjust provider versions based on feature requirements
# 5. Consider enabling provider-level logging for troubleshooting
# 6. Verify AWS provider authentication method (profile vs. environment variables)

# Configure Terraform settings and required providers
terraform {
  required_version = "~> 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
    
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5.0"
    }
  }
}

# Configure the AWS Provider with specified region and profile
provider "aws" {
  region  = "us-east-1"  # Specified in globals
  profile = "default"    # Specified in globals
  
  default_tags {
    tags = {
      Environment = "production"
      Terraform   = "true"
      Project     = "task-management-system"
    }
  }
}

# Configure the Random provider for generating random values
provider "random" {
  # No additional configuration needed for the random provider
}