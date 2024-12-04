/**
 * @fileoverview Centralized logging utility for backend services
 * 
 * Requirements Addressed:
 * - Centralized Logging (Technical Specification/System Design/System Monitoring)
 *   Implements a centralized logging utility to ensure consistent and structured 
 *   logging across backend services.
 * 
 * Human Tasks:
 * - Configure log file rotation settings in production environment
 * - Set up log aggregation service (e.g., ELK Stack) for production
 * - Configure log retention policies based on compliance requirements
 * - Set up log monitoring and alerting thresholds
 */

// winston v3.8.2
import winston from 'winston';
import { ERROR_CODES } from '../constants/error-codes';
import { STATUS_CODES } from '../constants/status-codes';
import type { ErrorResponse } from '../types/common.types';

/**
 * Winston logger configuration with custom format and multiple transports
 */
const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'task-management-system'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ] : [])
  ]
});

/**
 * Logs error messages with structured details
 * @param error ErrorResponse object containing error details
 */
const logError = (error: ErrorResponse): void => {
  winstonLogger.error({
    code: error.code,
    message: error.message,
    details: error.details,
    statusCode: error.code === ERROR_CODES.INTERNAL_SERVER_ERROR ? 
      STATUS_CODES.INTERNAL_SERVER_ERROR : 
      determineStatusCode(error.code),
    timestamp: new Date().toISOString()
  });
};

/**
 * Logs informational messages
 * @param message Information message to log
 */
const logInfo = (message: string): void => {
  winstonLogger.info({
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Logs debug messages for development purposes
 * @param message Debug message to log
 */
const logDebug = (message: string): void => {
  winstonLogger.debug({
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Helper function to determine HTTP status code based on error code
 * @param errorCode Error code from ERROR_CODES enum
 * @returns Appropriate HTTP status code
 */
const determineStatusCode = (errorCode: string): number => {
  switch (errorCode) {
    case ERROR_CODES.AUTHENTICATION_FAILED:
      return STATUS_CODES.UNAUTHORIZED;
    case ERROR_CODES.AUTHORIZATION_FAILED:
      return STATUS_CODES.FORBIDDEN;
    case ERROR_CODES.RESOURCE_NOT_FOUND:
      return STATUS_CODES.NOT_FOUND;
    case ERROR_CODES.VALIDATION_ERROR:
      return STATUS_CODES.BAD_REQUEST;
    default:
      return STATUS_CODES.INTERNAL_SERVER_ERROR;
  }
};

// Export the logger functions for use across backend services
export const logger = {
  logError,
  logInfo,
  logDebug
};