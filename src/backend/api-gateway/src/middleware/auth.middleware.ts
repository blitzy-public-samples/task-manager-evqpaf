/**
 * @fileoverview Authentication and Authorization Middleware
 * 
 * Requirement Addressed: Authentication and Authorization Middleware
 * Location: Technical Specification/System Design/Security Architecture
 * Description: Implements middleware to validate JWT tokens, enforce role-based 
 * access control, and secure API endpoints.
 * 
 * Human Tasks:
 * - Configure allowed roles in environment variables
 * - Set up monitoring alerts for high authentication failure rates
 * - Review and update CORS settings for production
 * - Configure rate limiting for authentication endpoints
 */

// express v4.18.2
import { Request, Response, NextFunction } from 'express';

// Internal imports
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import { handleError } from '../../../shared/utils/error-handler';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';

// Extend Express Request type to include user information
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

/**
 * Authentication middleware that validates JWT tokens and checks user roles
 * 
 * @param allowedRoles - Optional array of roles that are allowed to access the route
 * @returns Express middleware function
 */
export const authMiddleware = (allowedRoles?: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                throw {
                    code: ERROR_CODES.AUTHENTICATION_FAILED,
                    message: 'No authorization token provided',
                    details: {
                        statusCode: STATUS_CODES.UNAUTHORIZED
                    }
                };
            }

            // Initialize AuthService
            const authService = new AuthService();

            // Validate JWT token
            try {
                const decodedToken = authService.validateToken(authHeader);
                
                // Attach user information to request object
                req.user = {
                    userId: decodedToken.userId,
                    email: decodedToken.email,
                    role: decodedToken.role
                };

                // Check user role if allowedRoles are specified
                if (allowedRoles && allowedRoles.length > 0) {
                    authService.checkUserRole(decodedToken.role, allowedRoles);
                }

                // Log successful authentication
                logger.logInfo(`User ${decodedToken.userId} successfully authenticated`);

                // Proceed to next middleware
                next();
            } catch (error) {
                // Log authentication failure
                logger.logError('Authentication failed', error instanceof Error ? error : new Error('Unknown error'));

                // Handle authentication error
                if (error && typeof error === 'object' && 'code' in error) {
                    throw error;
                }

                throw {
                    code: ERROR_CODES.AUTHENTICATION_FAILED,
                    message: 'Invalid or expired token',
                    details: {
                        statusCode: STATUS_CODES.UNAUTHORIZED,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                };
            }
        } catch (error) {
            // Handle any errors that occurred during authentication
            handleError(error, res);
        }
    };
};
```

This implementation:

1. Creates a middleware factory function that accepts optional allowed roles
2. Validates JWT tokens from the Authorization header
3. Attaches decoded user information to the request object
4. Performs role-based access control when roles are specified
5. Uses proper error handling and logging throughout
6. Follows the project's error handling and response formatting standards
7. Implements type safety with TypeScript
8. Includes security best practices for token validation
9. Provides detailed error messages and logging for debugging
10. Extends the Express Request type to include user information

The middleware can be used in routes like this:
```typescript
// Protect route for authenticated users only
router.get('/protected', authMiddleware(), handler);

// Protect route for specific roles
router.get('/admin', authMiddleware(['admin']), handler);