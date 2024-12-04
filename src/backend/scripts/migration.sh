#!/bin/bash

# Human Tasks:
# - Ensure Knex CLI is installed globally or locally in the project (npm install -g knex@2.4.0 or npm install knex@2.4.0)
# - Configure database connection settings in knexfile.js
# - Set up appropriate database user permissions for migrations
# - Create backup of database before running migrations in production
# - Verify migration directory structure follows Knex.js conventions

# Requirement Addressed: Database Migration Automation
# Location: Technical Specification/System Design/Database Design/Data Management Strategy
# Description: This script automates the execution of database migrations to ensure 
# schema consistency across environments.

# Import relative path to logger module
LOGGER_PATH="../shared/utils/logger"

# Set migration directory path
export MIGRATION_DIR="./src/backend/database/migrations"

# Function to check if Node.js and npm are installed
check_dependencies() {
    if ! command -v node >/dev/null 2>&1; then
        echo "Error: Node.js is not installed"
        exit 1
    fi

    if ! command -v npm >/dev/null 2>&1; then
        echo "Error: npm is not installed"
        exit 1
    fi
}

# Function to check if Knex CLI is installed
check_knex() {
    if ! command -v knex >/dev/null 2>&1; then
        echo "Error: Knex CLI is not installed. Please install it using: npm install -g knex@2.4.0"
        exit 1
    fi
}

# Function to verify migration directory exists
check_migration_dir() {
    if [ ! -d "$MIGRATION_DIR" ]; then
        echo "Error: Migration directory does not exist: $MIGRATION_DIR"
        exit 1
    fi
}

# Main function to run migrations
run_migrations() {
    # Log migration start
    node -e "
        const { logInfo, logError } = require('$LOGGER_PATH');
        logInfo('Starting database migration process...');
    "

    # Run migrations using Knex CLI
    if knex migrate:latest; then
        # Log successful migration
        node -e "
            const { logInfo } = require('$LOGGER_PATH');
            logInfo('Database migrations completed successfully');
        "
    else
        # Log migration failure
        node -e "
            const { logError } = require('$LOGGER_PATH');
            logError({
                code: 'MIGRATION_FAILED',
                message: 'Database migration process failed',
                details: 'Check migration files and database connection'
            });
        "
        exit 1
    fi
}

# Main execution flow
main() {
    check_dependencies
    check_knex
    check_migration_dir
    run_migrations
}

# Execute main function
main