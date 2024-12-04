# Contributing to Task Management System

Thank you for your interest in contributing to the Task Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [Coding Standards](#coding-standards)
- [Testing Procedures](#testing-procedures)
- [Submitting Issues](#submitting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [CI/CD Pipeline](#cicd-pipeline)

## Development Environment Setup

### Prerequisites
- Node.js 20.x or higher
- Docker and Docker Compose
- Git
- PostgreSQL 14 or higher
- Redis 7.0 or higher

### Setting Up the Development Environment

1. Clone the repository:
```bash
git clone https://github.com/organization/task-management-system.git
cd task-management-system
```

2. Create environment files:
```bash
cp src/backend/.env.example src/backend/.env
cp src/web/.env.example src/web/.env
```

3. Start the development environment using Docker Compose:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start the following services:
- API Gateway (port 3000)
- Notification Service (port 3001)
- Project Service (port 3002)
- Task Service (port 3003)
- User Service (port 3004)
- Web Application (port 8080)
- PostgreSQL Database (port 5432)
- Redis Cache (port 6379)

## Coding Standards

### Backend (TypeScript)
- Follow the ESLint configuration defined in `src/backend/.eslintrc.ts`
- Use Prettier for code formatting with settings from `src/backend/.prettierrc`
- Follow TypeScript best practices and maintain strict type safety
- Document code using JSDoc comments
- Keep functions focused and maintainable (max complexity: 10)
- Use meaningful variable and function names
- Handle errors appropriately using the error handling utilities

### Frontend (TypeScript/React)
- Follow the ESLint configuration defined in `src/web/.eslintrc.ts`
- Use Prettier for code formatting with settings from `src/web/.prettierrc`
- Follow React best practices and hooks guidelines
- Maintain component-based architecture
- Use TypeScript interfaces for prop types and state
- Follow the established project structure

## Testing Procedures

### Backend Testing
- Write unit tests using Jest
- Maintain test coverage above 80%
- Run tests using:
```bash
cd src/backend
npm test
```

### Frontend Testing
- Write unit tests using Jest and React Testing Library
- Test components in isolation
- Run tests using:
```bash
cd src/web
npm test
```

## Submitting Issues

### Bug Reports
- Use the bug report template at `.github/ISSUE_TEMPLATE/bug_report.md`
- Include detailed steps to reproduce
- Provide environment details
- Include relevant logs or screenshots
- Tag issues appropriately

### Feature Requests
- Use the feature request template at `.github/ISSUE_TEMPLATE/feature_request.md`
- Clearly describe the problem and proposed solution
- Include use cases and acceptance criteria
- Consider alternatives and trade-offs

## Submitting Pull Requests

1. Create a new branch from `main`:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the coding standards

3. Write or update tests as needed

4. Commit your changes using conventional commit messages:
```bash
git commit -m "feat: add new feature"
```

5. Push your branch and create a pull request using the template at `.github/PULL_REQUEST_TEMPLATE.md`

6. Ensure all CI checks pass

7. Request review from appropriate code owners as defined in `.github/CODEOWNERS`

## CI/CD Pipeline

### Backend CI Pipeline
- Triggered on pushes to `main` and pull requests
- Runs linting, tests, and security scans
- Configured in `.github/workflows/backend-ci.yml`

### Frontend CI Pipeline
- Triggered on pushes to `main` and pull requests
- Runs linting, tests, and builds
- Configured in `.github/workflows/frontend-ci.yml`

### Code Review Process
1. All code changes require pull request review
2. Reviewers are automatically assigned based on `.github/CODEOWNERS`
3. CI checks must pass before merging
4. Pull requests must be up to date with the base branch

## Questions or Need Help?

If you have questions or need help with the contribution process, please:
1. Check the existing documentation
2. Search for existing issues
3. Create a new issue with the question if none exists

Thank you for contributing to the Task Management System!