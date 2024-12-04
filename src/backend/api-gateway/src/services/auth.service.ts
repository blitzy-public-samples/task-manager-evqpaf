/**
 * @fileoverview Authentication and Authorization Service
 * 
 * Human Tasks:
 * - Configure JWT secret key in environment variables
 * - Set up token expiration time in environment variables
 * - Configure allowed roles in environment configuration
 * - Set up monitoring for authentication failures
 * - Implement regular key rotation policy
 */

// jsonwebtoken v9.0.0
import jwt from 'jsonwebtoken';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/utils/error-handler';

/**
 * Interface for decoded JWT token payload
 */
interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Service class for handling authentication and authorization logic
 * 
 * Requirement Addressed: Authentication and Authorization Logic
 * Location: Technical Specification/System Design/Security Architecture
 * Description: Implements core authentication and authorization logic, including 
 * JWT validation and role-based access control.
 */
export class AuthService {
  private readonly jwtSecret: string;
  private readonly tokenExpiration: string;

  constructor() {
    // Load configuration from environment variables
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.tokenExpiration = process.env.TOKEN_EXPIRATION || '24h';

    // Validate required configuration
    if (process.env.NODE_ENV === 'production' && this.jwtSecret === 'your-secret-key') {
      logger.logError({
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'JWT secret key not properly configured in production',
        details: 'Default secret key is being used in production environment'
      });
      throw new Error('JWT secret key not properly configured');
    }
  }

  /**
   * Validates a JWT token and extracts user information
   * 
   * Requirement Addressed: Authentication and Authorization Logic
   * Description: Implements secure token validation with proper error handling
   * 
   * @param token - JWT token to validate
   * @returns Decoded user information if the token is valid
   * @throws Error with AUTHENTICATION_FAILED code if token is invalid
   */
  public validateToken(token: string): DecodedToken {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      // Verify and decode the token
      const decoded = jwt.verify(cleanToken, this.jwtSecret) as DecodedToken;

      // Check token expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        logger.logError({
          code: ERROR_CODES.AUTHENTICATION_FAILED,
          message: 'Token has expired',
          details: {
            expiration: new Date(decoded.exp * 1000).toISOString(),
            currentTime: new Date().toISOString()
          }
        });
        throw new Error('Token has expired');
      }

      return decoded;
    } catch (error) {
      logger.logError({
        code: ERROR_CODES.AUTHENTICATION_FAILED,
        message: 'Failed to validate token',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          token: token.substring(0, 10) + '...' // Log only first 10 chars for security
        }
      });

      throw {
        code: ERROR_CODES.AUTHENTICATION_FAILED,
        message: 'Authentication failed',
        details: {
          statusCode: STATUS_CODES.UNAUTHORIZED
        }
      };
    }
  }

  /**
   * Checks if a user has the required role for accessing a resource
   * 
   * Requirement Addressed: Authentication and Authorization Logic
   * Description: Implements role-based access control validation
   * 
   * @param userRole - Role of the authenticated user
   * @param allowedRoles - Array of roles that are allowed to access the resource
   * @returns true if the user role is allowed
   * @throws Error with AUTHORIZATION_FAILED code if role is not allowed
   */
  public checkUserRole(userRole: string, allowedRoles: string[]): boolean {
    try {
      // Validate inputs
      if (!userRole || !allowedRoles || !Array.isArray(allowedRoles)) {
        throw new Error('Invalid input parameters');
      }

      // Check if user role is in allowed roles
      const hasPermission = allowedRoles.includes(userRole);

      if (!hasPermission) {
        logger.logError({
          code: ERROR_CODES.AUTHORIZATION_FAILED,
          message: 'User role not authorized',
          details: {
            userRole,
            allowedRoles,
            statusCode: STATUS_CODES.FORBIDDEN
          }
        });

        throw {
          code: ERROR_CODES.AUTHORIZATION_FAILED,
          message: 'Authorization failed',
          details: {
            statusCode: STATUS_CODES.FORBIDDEN
          }
        };
      }

      return true;
    } catch (error) {
      // If error is already formatted, rethrow it
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      // Otherwise, format the error
      logger.logError({
        code: ERROR_CODES.AUTHORIZATION_FAILED,
        message: 'Failed to check user role',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          userRole,
          allowedRoles
        }
      });

      throw {
        code: ERROR_CODES.AUTHORIZATION_FAILED,
        message: 'Authorization failed',
        details: {
          statusCode: STATUS_CODES.FORBIDDEN
        }
      };
    }
  }
}