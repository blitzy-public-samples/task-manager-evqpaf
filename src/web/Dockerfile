# Human Tasks:
# 1. Verify Node.js version compatibility with project requirements
# 2. Ensure build environment variables are properly configured
# 3. Configure appropriate container security settings for production
# 4. Review container resource limits based on deployment requirements

# Requirement: Docker Build Configuration
# Location: Technical Specification/4.5 Development & Deployment/Docker Configuration

# Use Node.js 20 Alpine as base image for smaller footprint
# node v20-alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# This is done before copying the rest of the code to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
# npm v9.0+
RUN npm ci --only=production

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy the rest of the application code
COPY . .

# Build the application using Vite
# Uses the production configuration from vite.config.ts
RUN npm run build

# Remove development dependencies and source files to reduce image size
RUN npm prune --production && \
    rm -rf src tests

# Expose port 3000 for the application
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Use non-root user for security
USER node

# Start the application
CMD ["npm", "start"]

# Health check to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1