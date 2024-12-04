# Requirement Addressed: Containerization of Task Service
# Location: Technical Specification/2.3 Technical Decisions/Deployment Architecture
# Description: Ensures the Task Service is containerized for deployment in a Kubernetes cluster.

# Use Node.js 20 Alpine as the base image for a lightweight container
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files for dependency installation
# This is done before copying the rest of the code to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
# Using --production flag and ci for consistent installs
RUN npm ci --production

# Copy the rest of the application code
# This includes TypeScript source files and configuration
COPY . .

# Build the TypeScript code
# This creates the JavaScript files in the dist directory
RUN npm run build

# Expose port 3000 for the Task Service
EXPOSE 3000

# Start the application using the compiled JavaScript
CMD ["node", "dist/app.js"]