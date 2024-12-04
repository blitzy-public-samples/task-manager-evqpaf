# Requirement Addressed: Containerization of User Service
# Location: Technical Specification/System Design/Deployment Architecture
# Description: Ensures the User Service is containerized for consistent deployment across environments.

# Use Node.js 20 Alpine as base image for a lightweight container
FROM node:20-alpine

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and tsconfig.json for dependency installation and TypeScript configuration
COPY package.json /usr/src/app/package.json
COPY tsconfig.json /usr/src/app/tsconfig.json

# Install dependencies
# Note: npm ci is used instead of npm install in production for consistent installs
RUN npm ci

# Copy source code
COPY src/ /usr/src/app/src/

# Build TypeScript code
RUN npm run build

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the service port
EXPOSE 3000

# Start the User Service
ENTRYPOINT ["node", "dist/app.js"]