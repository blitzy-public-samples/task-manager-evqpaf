/**
 * @fileoverview CORS Configuration for API Gateway
 * 
 * Requirement Addressed: CORS Configuration
 * Location: Technical Specification/System Design/Security Architecture
 * Description: Implements CORS settings to control and secure cross-origin requests to the API Gateway.
 */

// Third-party imports
// cors v2.8.5
import cors from 'cors';
import { Express } from 'express';

// Internal imports
import { logApiRequest } from '../utils/logger';

/**
 * Human Tasks:
 * 1. Update allowed origins list based on environment-specific frontend domains
 * 2. Review and adjust CORS settings for production environment
 * 3. Configure additional security headers if required
 * 4. Set up monitoring for CORS-related issues
 */

/**
 * Configures CORS settings for the API Gateway.
 * 
 * @param {Express} app - Express application instance
 */
export const configureCors = (app: Express): void => {
    // Define CORS options based on security requirements
    const corsOptions: cors.CorsOptions = {
        // Allow requests only from trusted origins
        origin: process.env.NODE_ENV === 'production'
            ? [
                'https://taskmaster.com',
                'https://app.taskmaster.com',
                'https://api.taskmaster.com'
              ]
            : [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://127.0.0.1:3000'
              ],
        
        // Allow specific HTTP methods
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'PATCH',
            'OPTIONS'
        ],
        
        // Allow specific headers
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-API-Key'
        ],
        
        // Allow credentials (cookies, authorization headers)
        credentials: true,
        
        // Pre-flight request cache duration
        optionsSuccessStatus: 200,
        maxAge: 86400, // 24 hours
        
        // Expose specific headers to the client
        exposedHeaders: [
            'Content-Length',
            'X-Rate-Limit',
            'X-Rate-Limit-Remaining'
        ]
    };

    // Log CORS configuration for debugging
    logApiRequest('Configuring CORS settings for API Gateway');

    // Apply CORS middleware with configured options
    app.use(cors(corsOptions));

    // Add security headers
    app.use((req, res, next) => {
        // Prevent browsers from MIME-sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Enable strict XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Prevent clickjacking attacks
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Enable strict transport security
        if (process.env.NODE_ENV === 'production') {
            res.setHeader(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }
        
        next();
    });
};