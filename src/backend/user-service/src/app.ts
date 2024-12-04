/**
 * @fileoverview User Service Application Entry Point
 * 
 * Requirements Addressed:
 * - User Service Initialization (Technical Specification/System Design/Component Details)
 *   Ensures proper initialization of the User Service, including middleware, routing,
 *   and database setup.
 * 
 * Human Tasks:
 * - Configure CORS settings for production environment
 * - Set up rate limiting for API endpoints
 * - Configure API documentation (Swagger/OpenAPI)
 * - Set up monitoring and health check endpoints
 * - Review and adjust middleware order if needed
 */

// express v4.18.2
import express, { Application, Request, Response, NextFunction } from 'express';

// dotenv v16.0.3
import dotenv from 'dotenv';

// Internal imports
import { initializeDatabase } from './config/database.config';
import { userRoutes } from './routes/user.routes';
import { handleError } from '../../shared/utils/error-handler';
import { logger } from '../../shared/utils/logger';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';

/**
 * Initializes the User Service application by setting up middleware,
 * routes, and database connections.
 * 
 * @returns Promise<Application> An initialized Express application instance
 */
export const initializeApp = async (): Promise<Application> => {
    try {
        // Load environment variables
        dotenv.config();

        // Initialize Express application
        const app: Application = express();

        // Initialize database connection
        await initializeDatabase();
        logger.logInfo('Database initialized successfully');

        // Basic security middleware
        app.disable('x-powered-by'); // Hide Express
        app.use(express.json({ limit: '10mb' })); // Body parser with size limit
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // CORS middleware
        app.use((req: Request, res: Response, next: NextFunction) => {
            // Configure CORS based on environment
            const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
            const origin = req.headers.origin;

            if (origin && allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }

            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Allow-Credentials', 'true');

            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Request logging middleware
        app.use((req: Request, res: Response, next: NextFunction) => {
            logger.logInfo(`${req.method} ${req.path} - Request received`);
            next();
        });

        // Health check endpoint
        app.get('/health', (req: Request, res: Response) => {
            res.status(STATUS_CODES.OK).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'user-service'
            });
        });

        // Register routes
        app.use('/api/users', userRoutes);

        // 404 handler
        app.use((req: Request, res: Response) => {
            handleError({
                code: ERROR_CODES.RESOURCE_NOT_FOUND,
                message: `Route ${req.path} not found`,
                details: {
                    method: req.method,
                    path: req.path
                }
            }, res);
        });

        // Global error handler
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            handleError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'An unexpected error occurred',
                details: {
                    error: err.message,
                    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
                }
            }, res);
        });

        // Log successful initialization
        logger.logInfo('User Service initialized successfully');

        return app;
    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to initialize User Service',
            details: error
        });
        throw error;
    }
};