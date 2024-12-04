/**
 * @fileoverview Error handling middleware for the API Gateway
 * 
 * Requirement Addressed: Centralized Error Handling
 * Location: Technical Specification/System Design/Error Handling Standards
 * Description: Provides a standardized mechanism for handling errors across 
 * backend services, including logging, formatting, and response generation.
 * 
 * Human Tasks:
 * - Configure error monitoring system in production environment
 * - Set up error alerting thresholds for critical errors
 * - Configure error tracking service (e.g., Sentry) integration
 * - Review and update error messages for security compliance
 */

// express v4.18.2
import { Request, Response, NextFunction } from 'express';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { handleError } from '../../../shared/utils/error-handler';
import { logger } from '../../../shared/utils/logger';
import { formatErrorResponse } from '../../../shared/utils/response-formatter';
import { ErrorResponse } from '../../../shared/types/common.types';

/**
 * Middleware function for handling errors in the API Gateway.
 * Implements centralized error handling by providing consistent error processing
 * and response formatting for all API endpoints.
 * 
 * @param err - The error object caught by Express
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const errorMiddleware = (
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Convert standard Error to ErrorResponse format if needed
  const errorResponse: ErrorResponse = isErrorResponse(err) ? err : {
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: err.message || 'An unexpected error occurred',
    details: {
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  };

  // Special handling for validation errors
  if (err instanceof SyntaxError || err.name === 'ValidationError') {
    errorResponse.code = ERROR_CODES.VALIDATION_ERROR;
    errorResponse.message = 'Invalid request data';
  }

  // Log the error with request context
  logger.logError({
    ...errorResponse,
    details: {
      ...errorResponse.details,
      requestId: req.headers['x-request-id'],
      userAgent: req.headers['user-agent'],
      clientIp: req.ip
    }
  });

  // Use the error handler utility to process and send the response
  handleError(errorResponse, res);
};

/**
 * Type guard to check if an error is already in ErrorResponse format
 * 
 * @param error - The error object to check
 * @returns Boolean indicating if the error is an ErrorResponse
 */
const isErrorResponse = (error: Error | ErrorResponse): error is ErrorResponse => {
  return (
    'code' in error &&
    'message' in error &&
    'details' in error
  );
};

export default errorMiddleware;