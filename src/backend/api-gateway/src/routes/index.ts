/**
 * @fileoverview Central routing module for the API Gateway
 * 
 * Requirement Addressed: Centralized Routing
 * Location: Technical Specification/System Design/API Design
 * Description: Implements a centralized routing mechanism to integrate various 
 * route modules and apply middleware for consistent request handling.
 * 
 * Human Tasks:
 * 1. Review and configure CORS settings for production environment
 * 2. Set up rate limiting rules based on environment requirements
 * 3. Configure API documentation endpoints if using tools like Swagger/OpenAPI
 * 4. Review and adjust security headers based on security requirements
 */

// express v4.18.2
import { Router } from 'express';

// Internal imports
import healthRouter from './health.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import errorMiddleware from '../middleware/error.middleware';
import { loggingMiddleware } from '../middleware/logging.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';

/**
 * Initializes and integrates all route modules into the API Gateway,
 * applying necessary middleware for security, logging, validation, and error handling.
 * 
 * @param app - Express application instance
 */
export const initializeRoutes = (app: any): void => {
    // Create main router instance
    const router = Router();

    // Apply logging middleware to capture all requests
    router.use(loggingMiddleware);

    // Health check routes (no auth required)
    router.use('/health', healthRouter);

    // Apply authentication middleware for protected routes
    router.use(authMiddleware());

    // Apply validation middleware globally
    // Note: Individual route-specific schemas will be passed to the middleware
    router.use(validationMiddleware);

    // Mount the router on the app
    app.use('/api/v1', router);

    // Apply error handling middleware last
    app.use(errorMiddleware);
};