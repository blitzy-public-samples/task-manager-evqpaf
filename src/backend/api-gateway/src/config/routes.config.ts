/**
 * @fileoverview API Gateway Routes Configuration
 * 
 * Requirement Addressed: API Routing Configuration
 * Location: Technical Specification/System Design/API Design
 * Description: Defines the routing structure for the API Gateway, including paths, 
 * middleware, and controllers.
 * 
 * Human Tasks:
 * - Review and update CORS settings for production environment
 * - Configure rate limiting for API endpoints
 * - Set up monitoring for route performance metrics
 * - Review and update security headers configuration
 */

// express v4.18.2
import { Application, Request, Response } from 'express';

// Internal imports
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import errorMiddleware from '../middleware/error.middleware';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import { logger } from '../../../shared/utils/logger';

/**
 * Configures routes for the API Gateway application
 * Implements the routing structure requirement by setting up all API endpoints
 * with appropriate middleware and error handling.
 * 
 * @param app - Express application instance
 */
export const configureRoutes = (app: Application): void => {
    logger.logInfo('Initializing API Gateway routes');

    // Health check route - defined inline to avoid circular dependencies
    app.get('/health', healthCheckRoute);

    // Apply global error handling middleware
    app.use(errorMiddleware);

    // Handle undefined routes
    app.use('*', (req: Request, res: Response) => {
        res.status(STATUS_CODES.NOT_FOUND).json({
            success: false,
            statusCode: STATUS_CODES.NOT_FOUND,
            error: {
                message: `Route ${req.originalUrl} not found`,
                code: 'ROUTE_NOT_FOUND'
            },
            timestamp: new Date().toISOString()
        });
    });

    logger.logInfo('API Gateway routes initialized successfully');
};

/**
 * Health check route handler
 * Defined inline to avoid circular dependencies
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
const healthCheckRoute = (req: Request, res: Response): void => {
    res.status(STATUS_CODES.OK).json({
        success: true,
        statusCode: STATUS_CODES.OK,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'api-gateway'
        }
    });
};