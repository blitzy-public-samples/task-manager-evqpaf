# AWS Provider version: 5.0.0

# This file defines output values for the S3 module to enable other modules and services
# to access the S3 bucket's properties such as ID, ARN, region, and domain name.

# Requirement addressed: Scalable Cloud Infrastructure
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Provides output values for the S3 module to ensure seamless integration with other modules and services.

output "bucket_id" {
  description = "The ID of the S3 bucket."
  value       = aws_s3_bucket.s3_bucket.id
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket."
  value       = aws_s3_bucket.s3_bucket.arn
}

output "bucket_region" {
  description = "The region where the S3 bucket is located."
  value       = aws_s3_bucket.s3_bucket.region
}

output "bucket_domain_name" {
  description = "The domain name of the S3 bucket."
  value       = aws_s3_bucket.s3_bucket.bucket_domain_name
}