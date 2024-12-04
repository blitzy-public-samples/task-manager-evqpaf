# Terraform version: 1.5.0
# AWS Provider version: 5.0.0

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Implements backend configuration for Terraform to manage state storage 
# in a centralized and secure manner.

# List of human tasks:
# 1. Ensure the S3 bucket 'my-terraform-state-bucket' exists and is properly configured
# 2. Verify the DynamoDB table 'terraform-locks' exists with a primary key of 'LockID'
# 3. Confirm IAM permissions allow access to both the S3 bucket and DynamoDB table
# 4. Validate that encryption settings on the S3 bucket meet security requirements
# 5. Review S3 bucket versioning settings for state file version control
# 6. Ensure proper backup and retention policies are configured for the state bucket

terraform {
  # Configure the backend to store state in S3 with DynamoDB locking
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "terraform/state/production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true

    # Additional recommended settings for production use
    versioning     = true
    # Use workspace-aware path for state files
    workspace_key_prefix = "terraform/state"
  }
}