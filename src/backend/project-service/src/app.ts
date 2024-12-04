/**
 * @fileoverview Entry point for the Project Service
 * 
 * Requirements Addressed:
 * - Project Service Initialization (Technical Specification/System Design/Service Layer)
 *   Initializes the Project Service, including middleware, routes, and error handling.
 * 
 * Human Tasks:
 * - Configure environment variables for production deployment
 * - Set up monitoring and health check endpoints
 * - Configure rate limiting for API endpoints
 * - Review and update CORS settings for production
 * - Set up SSL/TLS certificates for HTTPS
 */

// express v4.18.2
import express, { Application } from 'express';
// cors v2.8.5
import cors from 'cors';
// helmet v6.0.1
import helmet from 'helmet';
// body-parser v1.20.2
import bodyParser from 'body-parser';

// Internal imports
import router from './routes/project.routes';
import { sequelizeInstance } from './config/database.config';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/utils/error-handler';

// Initialize Express application
const app: Application = express();

// Configure security middleware
app.use(helmet());

// Configure CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Configure request body parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database connection
sequelizeInstance.authenticate()
    .then(() => {
        logger.logInfo('Database connection established successfully');
    })
    .catch((error) => {
        logger.logError({
            code: 'DATABASE_CONNECTION_ERROR',
            message: 'Failed to connect to database',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    });

// Configure API routes
app.use('/api/projects', router);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', service: 'project-service' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    handleError(err, res);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.logInfo(`Project Service started on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.logError({
        code: 'UNCAUGHT_EXCEPTION',
        message: 'Uncaught exception occurred',
        details: error instanceof Error ? error.stack : 'Unknown error'
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
    logger.logError({
        code: 'UNHANDLED_REJECTION',
        message: 'Unhandled promise rejection occurred',
        details: reason instanceof Error ? reason.stack : 'Unknown error'
    });
    process.exit(1);
});

export default app;