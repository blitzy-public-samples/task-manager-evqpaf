/**
 * @fileoverview Health check route for the API Gateway
 * 
 * Requirement Addressed: Health Check Endpoint
 * Location: Technical Specification/System Design/API Design
 * Description: Implements a health check endpoint to monitor the availability 
 * and operational status of the API Gateway.
 */

// Third-party imports
// express v4.18.2
import { Router } from 'express';

// Internal imports
import { logger } from '../utils/logger';

/**
 * Handler for the health check endpoint requests.
 * Logs the request and returns a 200 OK status with a health status message.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const healthCheckHandler = (req: any, res: any): void => {
    // Log the health check request for monitoring
    logger.logInfo('Health check request received');

    // Return success response indicating service is operational
    res.status(200).json({
        status: 'healthy',
        service: 'api-gateway',
        timestamp: new Date().toISOString()
    });
};

// Initialize the router
const healthRouter = Router();

// Define the health check endpoint
healthRouter.get('/', healthCheckHandler);

// Export the router for use in the main application
export default healthRouter;