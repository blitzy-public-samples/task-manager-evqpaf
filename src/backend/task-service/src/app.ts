/**
 * Task Service Entry Point
 * 
 * Requirements Addressed:
 * - Task Service Initialization (Technical Specification/System Design/Component Details/Core Components)
 *   Implements the initialization of the Task Service, including middleware, routing, and error handling.
 * 
 * Human Tasks:
 * - Configure rate limiting settings for production
 * - Set up monitoring and health check endpoints
 * - Configure CORS allowed origins for production
 * - Review and adjust security headers configuration
 * - Set up request size limits for file uploads
 */

// express v4.18.2
import express, { Express } from 'express';
// helmet v6.0.1
import helmet from 'helmet';
// cors v2.8.5
import cors from 'cors';

import { taskRoutes } from './routes/task.routes';
import { handleError } from '../../shared/utils/error-handler';
import { logger } from '../../shared/utils/logger';

/**
 * Initializes the Express application with middleware, routes, and error handling.
 * @returns The initialized Express application instance
 */
export const initializeApp = (): Express => {
    // Create Express application instance
    const app = express();

    // Log application initialization
    logger.logInfo('Initializing Task Service application');

    // Configure security headers using Helmet
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            }
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: { policy: 'same-site' },
        dnsPrefetchControl: true,
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true
    }));

    // Configure CORS
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true,
        maxAge: 86400 // 24 hours
    }));

    // Configure JSON body parsing
    app.use(express.json({
        limit: '10mb'
    }));

    // Configure URL-encoded body parsing
    app.use(express.urlencoded({
        extended: true,
        limit: '10mb'
    }));

    // Register task routes
    app.use('/api/tasks', taskRoutes);

    // Register global error handling middleware
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        handleError(err, res);
    });

    // Log successful initialization
    logger.logInfo('Task Service application initialized successfully');

    return app;
};