/**
 * @fileoverview Centralized error handling utility for backend services
 * 
 * Requirement Addressed: Centralized Error Handling
 * Location: Technical Specification/System Design/Error Handling Standards
 * Description: Provides a standardized mechanism for handling errors across 
 * backend services, including logging, formatting, and response generation.
 * 
 * Human Tasks:
 * - Ensure error monitoring system is configured in production
 * - Set up error alerting thresholds for critical errors
 * - Configure error tracking service (e.g., Sentry) integration
 * - Review and update error messages for security compliance
 */

import { ERROR_CODES } from '../constants/error-codes';
import { STATUS_CODES } from '../constants/status-codes';
import { ErrorResponse } from '../types/common.types';
import { logger } from './logger';
import { formatErrorResponse } from './response-formatter';
import { Response } from 'express'; // express v4.18.2

/**
 * Handles errors by logging them and formatting a standardized error response.
 * Implements centralized error handling requirement by providing a consistent
 * way to process and respond to errors across the application.
 * 
 * @param error - The error object to be handled
 * @param res - Express response object to send the error response
 */
export const handleError = (error: Error | ErrorResponse, res: Response): void => {
    // Convert standard Error object to ErrorResponse format if needed
    const errorResponse: ErrorResponse = isErrorResponse(error) ? error : {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: error.message || 'An unexpected error occurred',
        details: {
            stack: error.stack,
            name: error.name
        }
    };

    // Determine appropriate status code based on error code
    const statusCode = determineStatusCode(errorResponse.code);

    // Log the error for monitoring and debugging
    logger.logError(errorResponse);

    // Format and send the error response
    const formattedResponse = formatErrorResponse(errorResponse, statusCode);
    res.status(statusCode).json(formattedResponse);
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

/**
 * Determines the appropriate HTTP status code based on the error code
 * 
 * @param errorCode - The error code from ERROR_CODES enum
 * @returns The corresponding HTTP status code
 */
const determineStatusCode = (errorCode: string): number => {
    switch (errorCode) {
        case ERROR_CODES.VALIDATION_ERROR:
            return STATUS_CODES.BAD_REQUEST;
        case ERROR_CODES.INTERNAL_SERVER_ERROR:
            return STATUS_CODES.INTERNAL_SERVER_ERROR;
        default:
            return STATUS_CODES.INTERNAL_SERVER_ERROR;
    }
};