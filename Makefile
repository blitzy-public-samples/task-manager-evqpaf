# Makefile for Task Management System
# Requirements Addressed:
# - Build Automation (Technical Specification/4.5 Development & Deployment/Deployment Pipeline)
# - Deployment Automation (Technical Specification/4.5 Development & Deployment/Deployment Pipeline)
# - CI/CD Integration (Technical Specification/4.5 Development & Deployment/Deployment Pipeline)

# Environment variables
BUILD_ENV ?= development
DEPLOY_ENV ?= development
MIGRATION_DIR := ./src/backend/database/migrations
DOCKER_COMPOSE_COMMAND := docker-compose

# Default target
.PHONY: all
all: setup build test

# Setup development environment
.PHONY: setup
setup:
	@echo "Setting up development environment..."
	@./src/backend/scripts/setup.sh

# Build all services
.PHONY: build
build: build-backend build-frontend

# Build backend services
.PHONY: build-backend
build-backend:
	@echo "Building backend services for $(BUILD_ENV) environment..."
	@./src/backend/scripts/build.sh

# Build frontend application
.PHONY: build-frontend
build-frontend:
	@echo "Building frontend application..."
	@cd src/web && npm install && npm run build

# Run tests
.PHONY: test
test: test-backend test-frontend

# Run backend tests
.PHONY: test-backend
test-backend:
	@echo "Running backend tests..."
	@cd src/backend && npm test

# Run frontend tests
.PHONY: test-frontend
test-frontend:
	@echo "Running frontend tests..."
	@cd src/web && npm test

# Deploy services
.PHONY: deploy
deploy:
	@echo "Deploying services to $(DEPLOY_ENV) environment..."
	@./src/backend/scripts/deploy.sh $(DEPLOY_ENV)

# Run database migrations
.PHONY: migrate
migrate:
	@echo "Running database migrations..."
	@./src/backend/scripts/migration.sh

# Start development environment
.PHONY: dev
dev:
	@echo "Starting development environment..."
	@$(DOCKER_COMPOSE_COMMAND) -f docker-compose.dev.yml up -d

# Start production environment
.PHONY: prod
prod:
	@echo "Starting production environment..."
	@$(DOCKER_COMPOSE_COMMAND) -f docker-compose.prod.yml up -d

# Stop all services
.PHONY: stop
stop:
	@echo "Stopping all services..."
	@$(DOCKER_COMPOSE_COMMAND) down

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf src/backend/*/dist
	@rm -rf src/web/dist
	@find . -name "node_modules" -type d -exec rm -rf {} +

# Initialize infrastructure using Terraform
.PHONY: init-infra
init-infra:
	@echo "Initializing infrastructure..."
	@cd infrastructure/terraform && terraform init

# Apply infrastructure changes
.PHONY: apply-infra
apply-infra:
	@echo "Applying infrastructure changes..."
	@cd infrastructure/terraform && terraform apply

# Destroy infrastructure
.PHONY: destroy-infra
destroy-infra:
	@echo "Destroying infrastructure..."
	@cd infrastructure/terraform && terraform destroy

# Apply Kubernetes configurations
.PHONY: k8s-apply
k8s-apply:
	@echo "Applying Kubernetes configurations..."
	@kubectl apply -f infrastructure/kubernetes/base/namespace.yaml
	@kubectl apply -f infrastructure/kubernetes/base/configmap.yaml
	@kubectl apply -f infrastructure/kubernetes/base/secrets.yaml
	@kubectl apply -f infrastructure/kubernetes/apps/

# Delete Kubernetes resources
.PHONY: k8s-delete
k8s-delete:
	@echo "Deleting Kubernetes resources..."
	@kubectl delete -f infrastructure/kubernetes/apps/
	@kubectl delete -f infrastructure/kubernetes/base/

# Show help
.PHONY: help
help:
	@echo "Task Management System Makefile"
	@echo "Available targets:"
	@echo "  setup         - Set up development environment"
	@echo "  build         - Build all services"
	@echo "  test          - Run all tests"
	@echo "  deploy        - Deploy services"
	@echo "  migrate       - Run database migrations"
	@echo "  dev           - Start development environment"
	@echo "  prod          - Start production environment"
	@echo "  stop          - Stop all services"
	@echo "  clean         - Clean build artifacts"
	@echo "  init-infra    - Initialize infrastructure"
	@echo "  apply-infra   - Apply infrastructure changes"
	@echo "  destroy-infra - Destroy infrastructure"
	@echo "  k8s-apply     - Apply Kubernetes configurations"
	@echo "  k8s-delete    - Delete Kubernetes resources"
	@echo "  help          - Show this help message"