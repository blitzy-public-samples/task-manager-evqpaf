# Use official Node.js 20-alpine image as base
# node v20-alpine
FROM node:20-alpine

# Set working directory as specified in globals
WORKDIR /usr/src/app

# Add labels for better container management
LABEL maintainer="Task Management System Team" \
      description="API Gateway for Task Management System" \
      version="1.0.0"

# Install required system dependencies
# Requirement Addressed: Containerization of API Gateway
# Location: Technical Specification/4.4 Third-Party Services/Containerization
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install npm dependencies
# npm v9.0.0 (comes with node:20-alpine)
RUN npm ci --only=production \
    && npm cache clean --force

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Copy shared modules
COPY ../shared/ ./shared/

# Build TypeScript code
RUN npm run build \
    && rm -rf src/ \
    && rm -rf shared/

# Remove development dependencies and source files to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Set ownership of application files
RUN chown -R nodejs:nodejs .

# Switch to non-root user
USER nodejs

# Expose API Gateway port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]