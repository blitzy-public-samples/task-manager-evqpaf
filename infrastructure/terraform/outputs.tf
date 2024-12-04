# Terraform version: 1.5.0
# AWS Provider version: 5.0.0

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Exposes critical infrastructure details such as resource IDs, endpoints, 
# and attributes to enable integration with other modules and environments.

# EKS Cluster Outputs
output "eks_cluster_endpoint" {
  description = "The endpoint of the EKS cluster."
  value       = module.eks.eks_cluster_endpoint
}

output "eks_cluster_id" {
  description = "The ID of the EKS cluster."
  value       = module.eks.eks_cluster_id
}

# RDS Outputs
output "rds_endpoint" {
  description = "The endpoint of the RDS instance."
  value       = aws_rds_instance.main.endpoint
}

output "rds_instance_id" {
  description = "The instance ID of the RDS instance."
  value       = aws_rds_instance.main.id
}

# Redis Outputs
output "redis_endpoint" {
  description = "The endpoint of the Redis cluster."
  value       = module.redis.redis_endpoint
}

output "redis_port" {
  description = "The port of the Redis cluster."
  value       = module.redis.redis_port
}

# S3 Bucket Outputs
output "s3_bucket_id" {
  description = "The ID of the S3 bucket."
  value       = module.s3.bucket_id
}

output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket."
  value       = module.s3.bucket_arn
}

# VPC Outputs
output "vpc_id" {
  description = "The ID of the VPC."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "The IDs of the public subnets."
  value       = module.vpc.public_subnet_ids
}