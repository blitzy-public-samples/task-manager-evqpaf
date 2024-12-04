/**
 * @fileoverview Utility functions for formatting API responses
 * 
 * Requirement Addressed: Consistent API Response Format
 * Location: Technical Specification/System Design/API Design/API Response Format
 * Description: Implements standardized response formatting to ensure consistency 
 * across all API endpoints.
 */

import { ERROR_CODES } from '../constants/error-codes';
import { STATUS_CODES } from '../constants/status-codes';
import { ErrorResponse } from '../types/common.types';

/**
 * Interface defining the structure of a successful API response
 */
interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

/**
 * Interface defining the structure of an error API response
 */
interface FormattedErrorResponse {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details: any;
  };
  timestamp: string;
}

/**
 * Formats a successful API response with a standardized structure.
 * 
 * @param data - The data to be included in the response
 * @param statusCode - The HTTP status code for the response (defaults to 200 OK)
 * @returns A standardized success response object
 */
export function formatSuccessResponse<T>(
  data: T,
  statusCode: number = STATUS_CODES.OK
): SuccessResponse<T> {
  return {
    success: true,
    statusCode,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Formats an error API response with a standardized structure.
 * 
 * @param error - The error response object containing code, message, and details
 * @param statusCode - The HTTP status code for the error response
 * @returns A standardized error response object
 */
export function formatErrorResponse(
  error: ErrorResponse,
  statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR
): FormattedErrorResponse {
  // Validate error code against known error codes
  if (!Object.values(ERROR_CODES).includes(error.code)) {
    error = {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      details: {
        originalError: error,
        message: 'Invalid error code provided'
      }
    };
    statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
  }

  // Map error codes to appropriate status codes if not explicitly provided
  if (statusCode === STATUS_CODES.INTERNAL_SERVER_ERROR) {
    switch (error.code) {
      case ERROR_CODES.AUTHENTICATION_FAILED:
        statusCode = STATUS_CODES.UNAUTHORIZED;
        break;
      case ERROR_CODES.AUTHORIZATION_FAILED:
        statusCode = STATUS_CODES.FORBIDDEN;
        break;
      case ERROR_CODES.RESOURCE_NOT_FOUND:
        statusCode = STATUS_CODES.NOT_FOUND;
        break;
      case ERROR_CODES.VALIDATION_ERROR:
        statusCode = STATUS_CODES.BAD_REQUEST;
        break;
      // INTERNAL_SERVER_ERROR remains as default
    }
  }

  return {
    success: false,
    statusCode,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    },
    timestamp: new Date().toISOString()
  };
}