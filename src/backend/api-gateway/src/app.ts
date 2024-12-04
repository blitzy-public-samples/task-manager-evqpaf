/**
 * @fileoverview API Gateway Application Entry Point
 * 
 * Human Tasks:
 * 1. Configure environment variables for production deployment
 * 2. Set up monitoring and alerting for application health
 * 3. Configure SSL/TLS certificates for HTTPS
 * 4. Review and adjust server timeouts for production
 * 5. Set up load balancer configuration if needed
 */

// Third-party imports
// express v4.18.2
import express, { Express } from 'express';

// Internal imports
import { configureCors } from './config/cors.config';
import { configureRateLimit } from './config/rate-limit.config';
import { configureRoutes } from './config/routes.config';
import { authMiddleware } from './middleware/auth.middleware';
import errorMiddleware from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { validationMiddleware } from './middleware/validation.middleware';
import { initializeRoutes } from './routes/index';
import { logger } from '../../shared/utils/logger';

/**
 * Initializes and configures the Express application with all necessary middleware,
 * routes, and error handling.
 * 
 * Requirement Addressed: API Gateway Initialization
 * Location: Technical Specification/System Design/API Design
 */
const initializeApp = (): void => {
    try {
        // Create Express application instance
        const app: Express = express();

        // Parse JSON bodies
        app.use(express.json({ limit: '10mb' }));
        
        // Parse URL-encoded bodies
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Apply logging middleware first to capture all requests
        // Requirement: Middleware Integration
        // Description: Integrates logging middleware for request tracking
        app.use(loggingMiddleware);

        // Configure CORS settings
        // Requirement: API Gateway Initialization
        // Description: Sets up CORS policies for cross-origin requests
        configureCors(app);

        // Configure rate limiting
        // Requirement: Middleware Integration
        // Description: Implements rate limiting to prevent abuse
        configureRateLimit(app);

        // Initialize and configure routes
        // Requirement: Routing Setup
        // Description: Sets up API routes with proper middleware
        initializeRoutes(app);

        // Apply error handling middleware last
        // Requirement: Middleware Integration
        // Description: Implements centralized error handling
        app.use(errorMiddleware);

        // Determine port from environment variables
        const port = process.env.PORT || 3000;

        // Start the server
        app.listen(port, () => {
            logger.logInfo(`API Gateway server started successfully on port ${port}`);
            logger.logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error: Error) => {
            logger.logError('Uncaught Exception', error);
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason: any) => {
            logger.logError('Unhandled Promise Rejection', 
                reason instanceof Error ? reason : new Error(String(reason))
            );
            process.exit(1);
        });

    } catch (error) {
        logger.logError('Failed to initialize API Gateway', 
            error instanceof Error ? error : new Error('Unknown error during initialization')
        );
        process.exit(1);
    }
};

// Export the initialization function
export default initializeApp;