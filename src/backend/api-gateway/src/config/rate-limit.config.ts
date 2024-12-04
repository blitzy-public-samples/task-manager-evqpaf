/**
 * @fileoverview Rate-limiting configuration for the API Gateway
 * 
 * Requirement Addressed: Rate Limiting Configuration
 * Location: Technical Specification/System Design/Security Architecture
 * Description: Implements rate-limiting policies to control the number of requests 
 * a client can make to the API Gateway within a specified time frame.
 */

// Third-party imports
// express-rate-limit v6.7.0
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

// Internal imports
import { logger } from '../utils/logger';

/**
 * Human Tasks:
 * 1. Review and adjust rate limit values based on production load testing results
 * 2. Configure Redis store for rate limiting in production environment
 * 3. Set up monitoring alerts for rate limit violations
 * 4. Document rate limit values in API documentation
 * 5. Ensure client applications are aware of rate limit headers
 */

/**
 * Configures rate-limiting middleware for the API Gateway.
 * Implements a sliding window rate limit to prevent API abuse.
 * 
 * @param {Express} app - Express application instance
 */
export const configureRateLimit = (app: Express): void => {
    // Define rate limit options
    const rateLimitOptions = {
        windowMs: 15 * 60 * 1000, // 15 minutes window
        max: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests from this IP, please try again later.',
        skipSuccessfulRequests: false, // Count successful requests against the rate limit
        skipFailedRequests: false, // Count failed requests against the rate limit
        handler: (req: any, res: any) => {
            logger.logWarning(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                status: 'error',
                message: 'Too many requests from this IP, please try again later.',
                retryAfter: res.getHeader('Retry-After')
            });
        }
    };

    // Log rate limit configuration
    logger.logInfo(`Configuring rate limit: ${rateLimitOptions.max} requests per ${rateLimitOptions.windowMs / 1000} seconds`);

    // Create and apply rate limiting middleware
    const limiter = rateLimit(rateLimitOptions);
    app.use(limiter);

    // Apply stricter rate limits to specific endpoints if needed
    const authLimiter = rateLimit({
        ...rateLimitOptions,
        windowMs: 60 * 60 * 1000, // 1 hour window
        max: 5, // Limit each IP to 5 requests per windowMs
        message: 'Too many authentication attempts, please try again later.'
    });

    // Apply stricter rate limit to authentication endpoints
    app.use('/api/auth', authLimiter);

    logger.logInfo('Rate limiting middleware configured successfully');
};