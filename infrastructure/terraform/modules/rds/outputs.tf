# Required Providers:
# - hashicorp/terraform v1.5.0
# - hashicorp/aws v5.0.0

# This file addresses the following requirements from Technical Specification/2.2 Component Details/Data Storage Components:
# - Infrastructure as Code: Implements output variables for the RDS module to expose critical details 
#   such as the RDS endpoint and instance ID for integration with other modules.

output "rds_endpoint" {
  description = "The endpoint of the RDS instance."
  value       = aws_db_instance.main.endpoint
}

output "rds_instance_id" {
  description = "The instance ID of the RDS instance."
  value       = aws_db_instance.main.id
}