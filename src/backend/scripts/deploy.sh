#!/bin/bash

# Human Tasks:
# 1. Configure AWS credentials and ensure proper IAM permissions
# 2. Set up Kubernetes cluster access and configure kubeconfig
# 3. Install required tools: Docker, Terraform, kubectl
# 4. Configure environment-specific variables in CI/CD pipeline
# 5. Set up monitoring for deployment process
# 6. Configure backup strategy before deployments
# 7. Review and adjust resource limits in Kubernetes manifests

# Requirements Addressed:
# - Automated Deployment (Technical Specification/4.5 Development & Deployment/Deployment Pipeline)
#   Implements automated deployment process for backend services and infrastructure
# - Infrastructure as Code (Technical Specification/2.2 Component Details/Data Storage Components)
#   Integrates with Terraform to manage cloud infrastructure

# Import the build script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/build.sh"

# Set default environment if not specified
DEPLOY_ENV=${DEPLOY_ENV:-development}

# Function to validate environment
validate_environment() {
    case "$DEPLOY_ENV" in
        development|staging|production)
            echo "Deploying to $DEPLOY_ENV environment"
            ;;
        *)
            echo "Error: Invalid environment. Must be one of: development, staging, production"
            return 1
            ;;
    esac
}

# Function to deploy infrastructure using Terraform
deploy_infrastructure() {
    echo "Deploying infrastructure with Terraform..."
    
    # Initialize Terraform
    terraform -chdir=infrastructure/terraform init || return 1
    
    # Select workspace based on environment
    terraform -chdir=infrastructure/terraform workspace select "$DEPLOY_ENV" || \
    terraform -chdir=infrastructure/terraform workspace new "$DEPLOY_ENV" || return 1
    
    # Plan and apply Terraform changes
    terraform -chdir=infrastructure/terraform plan -var="environment=$DEPLOY_ENV" -out=tfplan || return 1
    terraform -chdir=infrastructure/terraform apply -auto-approve tfplan || return 1
}

# Function to deploy Kubernetes resources
deploy_kubernetes_resources() {
    echo "Deploying Kubernetes resources..."
    
    # Apply namespace
    kubectl apply -f infrastructure/kubernetes/base/namespace.yaml || return 1
    
    # Apply ConfigMap and Secrets
    kubectl apply -f infrastructure/kubernetes/base/configmap.yaml || return 1
    kubectl apply -f infrastructure/kubernetes/base/secrets.yaml || return 1
    
    # Deploy API Gateway
    kubectl apply -f infrastructure/kubernetes/apps/api-gateway/deployment.yaml || return 1
    kubectl apply -f infrastructure/kubernetes/apps/api-gateway/service.yaml || return 1
    
    # Apply ingress configuration
    kubectl apply -f infrastructure/kubernetes/base/ingress.yaml || return 1
}

# Function to verify deployment
verify_deployment() {
    echo "Verifying deployment..."
    
    # Check API Gateway deployment status
    kubectl rollout status deployment/api-gateway -n task-management-system || return 1
    
    # Verify services are running
    kubectl get services -n task-management-system || return 1
    
    # Check pods status
    kubectl get pods -n task-management-system || return 1
}

# Main deployment function
deploy_backend_services() {
    local environment="$1"
    DEPLOY_ENV="$environment"
    
    echo "Starting deployment process for environment: $DEPLOY_ENV"
    
    # Validate environment
    validate_environment || return 1
    
    # Build backend services
    build_backend_services "all-services" || {
        echo "Error: Failed to build backend services"
        return 1
    }
    
    if [ "$DEPLOY_ENV" = "development" ]; then
        # Deploy locally using Docker Compose
        echo "Deploying services locally with Docker Compose..."
        docker-compose up -d || return 1
    else
        # Deploy to cloud infrastructure
        deploy_infrastructure || {
            echo "Error: Failed to deploy infrastructure"
            return 1
        }
        
        # Deploy Kubernetes resources
        deploy_kubernetes_resources || {
            echo "Error: Failed to deploy Kubernetes resources"
            return 1
        }
        
        # Verify deployment
        verify_deployment || {
            echo "Error: Deployment verification failed"
            return 1
        }
    fi
    
    echo "Deployment completed successfully"
    return 0
}

# Export the deployment function
export -f deploy_backend_services

# If script is run directly (not sourced), execute deployment
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    # Default environment if not provided
    ENVIRONMENT=${1:-"development"}
    
    deploy_backend_services "$ENVIRONMENT"
    exit $?
fi