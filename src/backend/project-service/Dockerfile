# Requirement Addressed: Containerization of Project Service
# Location: Technical Specification/4.4 Third-Party Services/Compute
# Description: Defines the containerization process for the Project Service, enabling deployment in a Kubernetes cluster.

# Use official Node.js 20-alpine as the base image for minimal size and security
FROM node:20-alpine

# Requirement Addressed: Consistent Build Environment
# Location: Technical Specification/4.5 Development & Deployment/Deployment Pipeline
# Description: Ensures a consistent and reproducible build environment for the Project Service.

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and tsconfig.json first to leverage Docker layer caching
COPY package.json tsconfig.json ./

# Install dependencies using npm
# npm v9.0+
RUN npm install

# Copy the source code into the container
COPY src/ ./src/

# Build TypeScript code into JavaScript
RUN npm run build

# Remove development dependencies to reduce image size
RUN npm prune --production

# Expose port 3000 for the service
EXPOSE 3000

# Define the default command to start the application
CMD ["node", "./dist/app.js"]