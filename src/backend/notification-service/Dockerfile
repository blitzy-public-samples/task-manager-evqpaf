# Use Node.js 20 Alpine as base image for a lightweight container
# node v20-alpine
FROM node:20-alpine

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and tsconfig.json for dependency installation and TypeScript configuration
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
# Using clean install (ci) for consistent installations across builds
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Build TypeScript code
RUN npm run build

# Set environment variables with defaults
ENV NODE_ENV=production \
    PORT=3000 \
    WEBSOCKET_PORT=8080 \
    SMTP_HOST=smtp.example.com \
    SMTP_PORT=587 \
    SMTP_SECURE=false \
    REDIS_HOST=localhost \
    REDIS_PORT=6379

# Expose ports for HTTP and WebSocket servers
EXPOSE 3000
EXPOSE 8080

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create necessary directories with correct permissions
RUN mkdir -p /usr/src/app/logs && \
    chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/app.js"]

# Human Tasks:
# - Configure environment variables in deployment environment:
#   - SMTP_HOST: Email server hostname
#   - SMTP_PORT: Email server port
#   - SMTP_USER: Email server username
#   - SMTP_PASSWORD: Email server password
#   - SMTP_SECURE: Whether to use SSL/TLS
#   - EMAIL_FROM: Default sender email address
#   - REDIS_HOST: Redis server hostname
#   - REDIS_PORT: Redis server port
#   - REDIS_PASSWORD: Redis server password
#   - ALLOWED_ORIGINS: CORS allowed origins
# - Set up SSL/TLS certificates for production
# - Configure container monitoring and logging
# - Set up container orchestration (e.g., Kubernetes)
# - Configure container resource limits
# - Set up container registry credentials
# - Configure network security policies