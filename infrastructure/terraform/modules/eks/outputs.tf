# Terraform AWS Provider version: 5.0.0
# Terraform version: 1.5.0

# Requirement addressed: Scalable Cloud Infrastructure
# Location: Technical Specification/2.2 Component Details/Core Components
# Description: Provides output variables for accessing key attributes of the EKS cluster,
# enabling integration with other modules and services.

output "eks_cluster_id" {
  description = "The ID of the EKS cluster."
  value       = aws_eks_cluster.eks_cluster.id
}

output "eks_cluster_endpoint" {
  description = "The endpoint of the EKS cluster."
  value       = aws_eks_cluster.eks_cluster.endpoint
}

output "eks_cluster_certificate_authority" {
  description = "The certificate authority data for the EKS cluster."
  value       = aws_eks_cluster.eks_cluster.certificate_authority[0].data
  sensitive   = true
}

output "eks_node_group_arns" {
  description = "The ARNs of the EKS node groups."
  value       = aws_eks_node_group.node_group.arn
}

output "eks_node_group_ids" {
  description = "The IDs of the EKS node groups."
  value       = aws_eks_node_group.node_group.id
}