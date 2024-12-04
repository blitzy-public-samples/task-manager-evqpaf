# AWS Provider version: 5.0.0
# Terraform version: 1.5.0

# Requirement addressed: Cache Layer
# Location: Technical Specification/2.2 Component Details/Data Storage Components
# Description: Exposes outputs such as Redis endpoint and port for integration 
# with other services requiring caching.

# Requirement addressed: Infrastructure as Code
# Location: Technical Specification/4.5 Development & Deployment/Infrastructure Requirements
# Description: Provides outputs for Redis resources to enable seamless integration 
# and reuse in Terraform configurations.

output "redis_endpoint" {
  description = "The endpoint of the Redis Elasticache cluster."
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "redis_port" {
  description = "The port number of the Redis Elasticache cluster."
  value       = aws_elasticache_cluster.main.port
}