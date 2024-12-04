# Requirements Addressed:
# - Containerization (Technical Specification/4.5 Development & Deployment/Containerization)
#   Provides a Dockerfile to containerize the backend services for consistent deployment across environments.

# Human Tasks:
# - Ensure Docker daemon is running and has sufficient resources allocated
# - Configure container registry access if using private registries
# - Set up necessary environment variables in deployment pipeline
# - Review security scanning results for base image
# - Configure container resource limits in orchestration platform

# Base image - Node.js 20 LTS Alpine for minimal footprint
# node v20-alpine
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
# npm v9.0+
RUN npm ci --only=production

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Remove development dependencies and source code
RUN npm prune --production && \
    rm -rf src/ && \
    rm -rf node_modules/typescript

# Create non-root user for security
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]