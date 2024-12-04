# Task Management System - Backend Services

## Overview

The backend services of the Task Management System provide a robust, scalable, and secure foundation for managing tasks, projects, users, and notifications. Built using a microservices architecture, the system ensures high availability, maintainability, and performance.

## Architecture

The backend consists of the following microservices:

- **API Gateway**: Entry point for all client requests, handling authentication and routing
- **User Service**: Manages user accounts, authentication, and authorization
- **Project Service**: Handles project creation, updates, and team management
- **Task Service**: Manages task lifecycle, assignments, and status updates
- **Notification Service**: Handles real-time notifications and email communications

For detailed architecture information, see [Architecture Documentation](./docs/architecture.md).

## Prerequisites

- Node.js 20.x LTS
- Docker 24.x+
- Docker Compose 2.x+
- PostgreSQL 14.x
- Redis 7.x

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd src/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the setup script:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

5. Start the services:
```bash
docker-compose up -d
```

## Development

### Running Services Locally

Each service can be run independently for development:

```bash
# API Gateway
cd api-gateway
npm run dev

# User Service
cd user-service
npm run dev

# Project Service
cd project-service
npm run dev

# Task Service
cd task-service
npm run dev

# Notification Service
cd notification-service
npm run dev
```

### Testing

Run tests for all services:
```bash
npm test
```

Run tests for a specific service:
```bash
cd <service-name>
npm test
```

## Deployment

For detailed deployment instructions, see [Deployment Documentation](./docs/deployment.md).

Quick deployment using provided scripts:

```bash
# Build all services
./scripts/build.sh

# Deploy to environment
./scripts/deploy.sh <environment>
```

### Available Environments
- development
- staging
- production

## Security

The system implements comprehensive security measures:

- JWT-based authentication
- Role-based access control
- Data encryption at rest and in transit
- Secure session management
- Input validation and sanitization

For detailed security information, see [Security Documentation](./docs/security.md).

## API Documentation

API documentation is available at:
- Development: http://localhost:3000/api/docs
- Staging: https://api-staging.taskmanagement.com/docs
- Production: https://api.taskmanagement.com/docs

## Service Ports

Default ports for local development:
- API Gateway: 3000
- User Service: 3004
- Project Service: 3002
- Task Service: 3003
- Notification Service: 3001

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

For detailed contribution guidelines, see CONTRIBUTING.md.

## Monitoring and Logging

- Centralized logging using Winston
- Prometheus metrics collection
- Grafana dashboards for visualization
- Health check endpoints for each service

## Troubleshooting

Common issues and solutions:

1. Service Connection Issues
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs <service-name>
```

2. Database Connection Issues
```bash
# Check database status
docker-compose logs postgres

# Verify database migrations
./scripts/migration.sh
```

3. Redis Connection Issues
```bash
# Check Redis status
docker-compose logs redis

# Verify Redis connection
redis-cli ping
```

## Support

For support and issues:
1. Check the troubleshooting guide
2. Review service logs
3. Contact the platform team
4. Submit an issue in the repository

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.