#!/bin/bash

# Human Tasks:
# 1. Ensure Docker is installed (v24.0+) and Docker daemon is running
# 2. Ensure Node.js (v20.0+) and npm (v9.0+) are installed
# 3. Ensure Docker Compose (v2.0+) is installed
# 4. Verify network ports required by services are available (see .env.example)
# 5. Configure any necessary firewall rules for service communication
# 6. Ensure sufficient disk space for dependencies and Docker images

# Requirement Addressed: Backend Setup Automation
# Location: Technical Specification/4.5 Development & Deployment/Development Tools
# Description: Automates the setup of backend services, including dependency installation,
# environment variable configuration, and service initialization.

# Set error handling
set -e

# Define color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Define log functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check required tools
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker v24.0+"
        exit 1
    fi
    
    # Check Docker version
    docker_version=$(docker --version | cut -d ' ' -f3 | cut -d '.' -f1)
    if [ "$docker_version" -lt 24 ]; then
        log_error "Docker version must be 24.0 or higher"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose v2.0+"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js v20.0+"
        exit 1
    fi
    
    # Check Node.js version
    node_version=$(node --version | cut -d 'v' -f2 | cut -d '.' -f1)
    if [ "$node_version" -lt 20 ]; then
        log_error "Node.js version must be 20.0 or higher"
        exit 1
    }
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm v9.0+"
        exit 1
    fi
    
    # Check npm version
    npm_version=$(npm --version | cut -d '.' -f1)
    if [ "$npm_version" -lt 9 ]; then
        log_error "npm version must be 9.0 or higher"
        exit 1
    fi
    
    log_info "All prerequisites are satisfied"
}

# Function to setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    # Check if .env file exists
    if [ -f "../.env" ]; then
        log_warn "Existing .env file found"
        read -p "Do you want to overwrite it? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing .env file"
            return
        fi
    fi
    
    # Copy .env.example to .env
    if cp "../.env.example" "../.env"; then
        log_info "Environment file created successfully"
        log_warn "Please update the .env file with your actual configuration values"
    else
        log_error "Failed to create environment file"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    log_info "Installing Node.js dependencies..."
    
    # Change to backend root directory
    cd ..
    
    # Install dependencies using npm
    if npm install; then
        log_info "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
    
    # Return to scripts directory
    cd scripts
}

# Function to start services
start_services() {
    log_info "Starting backend services..."
    
    # Change to backend root directory
    cd ..
    
    # Start services using Docker Compose
    if docker-compose up -d; then
        log_info "Services started successfully"
    else
        log_error "Failed to start services"
        exit 1
    fi
    
    # Return to scripts directory
    cd scripts
}

# Function to run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Execute migration script
    if ./migration.sh; then
        log_info "Database migrations completed successfully"
    else
        log_error "Failed to run database migrations"
        exit 1
    fi
}

# Main function to orchestrate setup
main() {
    log_info "Starting backend setup process..."
    
    # Execute setup steps
    check_prerequisites
    setup_environment
    install_dependencies
    start_services
    run_migrations
    
    log_info "Backend setup completed successfully"
    log_info "You can now access the backend services using the configured ports in .env"
}

# Execute main function
main