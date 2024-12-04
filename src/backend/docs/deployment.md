# Task Management System - Deployment Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Deployment Prerequisites](#deployment-prerequisites)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)

## Introduction
This document outlines the deployment process for the Task Management System's backend services. It provides comprehensive instructions for setting up the infrastructure, deploying services, and managing the deployment pipeline.

## Deployment Prerequisites

### Required Tools
- Terraform v1.5.0+
- Kubernetes v1.26+
- Docker v20.10+
- AWS CLI v2.0+
- kubectl v1.26+
- Helm v3.0+

### Environment Configuration
1. AWS Credentials:
```bash
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_DEFAULT_REGION=us-east-1
```

2. Kubernetes Configuration:
```bash
aws eks update-kubeconfig --name task-management-cluster --region us-east-1
```

## Infrastructure Setup

### 1. Initialize Terraform
```bash
cd infrastructure/terraform
terraform init
```

### 2. Configure Environment Variables
Create a `terraform.tfvars` file:
```hcl
environment = "production"
vpc_cidr = "10.0.0.0/16"
eks_cluster_name = "task-management-cluster"
db_instance_class = "db.t3.medium"
redis_node_type = "cache.t3.medium"
s3_bucket_name = "task-management-bucket"
```

### 3. Deploy Infrastructure
```bash
terraform plan -out=tfplan
terraform apply tfplan
```

This will create:
- VPC with public and private subnets
- EKS cluster
- RDS PostgreSQL database
- ElastiCache Redis cluster
- S3 bucket for file storage

## Kubernetes Deployment

### 1. Create Namespace
```bash
kubectl apply -f infrastructure/kubernetes/base/namespace.yaml
```

### 2. Configure Secrets
```bash
kubectl apply -f infrastructure/kubernetes/base/secrets.yaml
```

### 3. Deploy Services
```bash
# Deploy API Gateway
kubectl apply -f infrastructure/kubernetes/apps/api-gateway/deployment.yaml
kubectl apply -f infrastructure/kubernetes/apps/api-gateway/service.yaml

# Deploy other services
kubectl apply -f infrastructure/kubernetes/apps/user-service/deployment.yaml
kubectl apply -f infrastructure/kubernetes/apps/task-service/service.yaml
kubectl apply -f infrastructure/kubernetes/apps/project-service/service.yaml
```

### 4. Configure Ingress
```bash
kubectl apply -f infrastructure/kubernetes/base/ingress.yaml
```

## CI/CD Pipeline

The CI/CD pipeline is configured using GitHub Actions and consists of the following stages:

1. Build and Test:
   - Code checkout
   - Dependency installation
   - Linting
   - Unit and integration tests
   - Build artifacts

2. Security Scan:
   - npm audit
   - Dependency vulnerability scanning

3. Deployment:
   - Infrastructure updates via Terraform
   - Kubernetes deployments
   - Service health checks

Pipeline configuration is defined in `.github/workflows/backend-ci.yml`.

## Security Considerations

### Network Security
- All services are deployed in private subnets
- Access is controlled via security groups
- API Gateway is the only externally accessible service

### Secrets Management
- Sensitive data is stored in Kubernetes Secrets
- Database credentials are managed via AWS Secrets Manager
- TLS certificates are required for all external communication

### Access Control
- RBAC is implemented for Kubernetes resources
- IAM roles are used for AWS service access
- Network policies restrict inter-service communication

## Troubleshooting

### Common Issues

1. Database Connection Issues
```bash
# Check RDS endpoint
kubectl exec -it <pod-name> -- env | grep DB_HOST

# Verify security group rules
aws ec2 describe-security-groups --group-ids <security-group-id>
```

2. Service Discovery Problems
```bash
# Check DNS resolution
kubectl run -it --rm debug --image=busybox -- nslookup <service-name>

# Verify service endpoints
kubectl get endpoints
```

3. Pod Startup Failures
```bash
# Check pod status
kubectl describe pod <pod-name>

# View pod logs
kubectl logs <pod-name>
```

### Health Checks
Monitor service health using:
```bash
# Check pod status
kubectl get pods -n task-management-system

# View service status
kubectl get services -n task-management-system

# Check ingress status
kubectl get ingress -n task-management-system
```

### Logging
Access centralized logs:
```bash
# View pod logs
kubectl logs -f deployment/api-gateway -n task-management-system

# Export logs
kubectl logs deployment/api-gateway -n task-management-system > api-gateway.log
```

For additional support or issues not covered here, please contact the platform team or refer to the internal documentation portal.