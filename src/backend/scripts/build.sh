#!/bin/bash

# Human Tasks:
# - Ensure Node.js 20 LTS is installed on the build system
# - Configure npm registry access if using private packages
# - Set up necessary environment variables in CI/CD pipeline
# - Ensure TypeScript compiler is installed globally or as a dev dependency
# - Configure build environment-specific variables (development, staging, production)

# Requirements Addressed:
# - Build Automation (Technical Specification/4.5 Development & Deployment/Deployment Pipeline)
#   Implements automated build process for backend services with proper error handling and logging

# Import relative path to logger and error handler
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Source the TypeScript files using node
# Note: We use node to execute the TypeScript files directly since they contain the logging functionality
LOGGER_PATH="$PROJECT_ROOT/src/backend/shared/utils/logger.ts"
ERROR_HANDLER_PATH="$PROJECT_ROOT/src/backend/shared/utils/error-handler.ts"

# Function to handle script errors
handle_error() {
    local error_message="$1"
    # Use node to execute the logger for error reporting
    node -e "
        require('ts-node/register');
        const { logger } = require('$LOGGER_PATH');
        logger.logError({
            code: 'BUILD_ERROR',
            message: '$error_message',
            details: {
                timestamp: new Date().toISOString(),
                script: 'build.sh'
            }
        });
    "
    exit 1
}

# Function to log information
log_info() {
    local message="$1"
    # Use node to execute the logger for info logging
    node -e "
        require('ts-node/register');
        const { logger } = require('$LOGGER_PATH');
        logger.logInfo('$message');
    "
}

# Function to build backend services
build_backend_services() {
    local service_name="$1"
    
    # Set default build environment if not specified
    BUILD_ENV=${BUILD_ENV:-development}
    
    log_info "Starting build process for $service_name in $BUILD_ENV environment"
    
    # Validate environment
    case "$BUILD_ENV" in
        development|staging|production)
            log_info "Building for $BUILD_ENV environment"
            ;;
        *)
            handle_error "Invalid BUILD_ENV: $BUILD_ENV. Must be one of: development, staging, production"
            return 1
            ;;
    esac
    
    # Prepare build environment
    log_info "Preparing build environment"
    
    # Clean previous build artifacts
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "Cleaned previous build artifacts"
    fi
    
    # Install dependencies
    log_info "Installing dependencies"
    # npm v9.0+
    npm ci || {
        handle_error "Failed to install dependencies"
        return 1
    }
    
    # Run tests
    log_info "Running tests"
    npm test || {
        handle_error "Tests failed"
        return 1
    }
    
    # Build TypeScript code
    log_info "Compiling TypeScript"
    npm run build || {
        handle_error "TypeScript compilation failed"
        return 1
    }
    
    # Environment-specific build steps
    case "$BUILD_ENV" in
        production)
            # Production-specific optimizations
            log_info "Running production optimizations"
            npm prune --production || {
                handle_error "Failed to remove development dependencies"
                return 1
            }
            ;;
        staging)
            # Staging-specific configurations
            log_info "Applying staging configurations"
            ;;
        development)
            # Development-specific configurations
            log_info "Applying development configurations"
            ;;
    esac
    
    log_info "Build completed successfully for $service_name in $BUILD_ENV environment"
    return 0
}

# Export the build function to make it available for external use
export -f build_backend_services

# If script is run directly (not sourced), execute build for all services
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    # Default service name if not provided
    SERVICE_NAME=${1:-"all-services"}
    
    build_backend_services "$SERVICE_NAME"
    exit $?
fi