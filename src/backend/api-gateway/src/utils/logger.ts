/**
 * @fileoverview Centralized logging utility for the API Gateway
 * 
 * Requirement Addressed: Centralized Logging
 * Location: Technical Specification/System Design/System Monitoring
 * Description: Implements a standardized logging mechanism to capture and store 
 * logs for debugging, monitoring, and auditing purposes.
 */

// Third-party imports
// winston v3.8.2
import winston from 'winston';

// Internal imports
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';

/**
 * Human Tasks:
 * 1. Ensure log directory exists and has appropriate write permissions
 * 2. Configure log rotation policy in production environment
 * 3. Set up appropriate log levels based on environment (development/staging/production)
 * 4. Configure log aggregation service integration if required
 * 5. Set up log monitoring and alerting based on error patterns
 */

// Configure winston format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Initialize Winston logger with configuration
const winstonLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'api-gateway' },
    transports: [
        // Write logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: 'logs/combined.log'
        }),
        // Write error logs to error.log
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        })
    ]
});

/**
 * Logs informational messages to the log file.
 * 
 * @param {string} message - The informational message to log
 */
const logInfo = (message: string): void => {
    winstonLogger.info(message, {
        timestamp: new Date().toISOString()
    });
};

/**
 * Logs error messages along with error details to the log file.
 * 
 * @param {string} message - The error message to log
 * @param {Error} error - The error object containing additional details
 */
const logError = (message: string, error: Error): void => {
    const errorDetails = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
        name: error.name
    };

    winstonLogger.error(message, {
        error: errorDetails
    });
};

/**
 * Logs warning messages to the log file.
 * 
 * @param {string} message - The warning message to log
 */
const logWarning = (message: string): void => {
    winstonLogger.warn(message, {
        timestamp: new Date().toISOString()
    });
};

// Export the logging functions
export const logger = {
    logInfo,
    logError,
    logWarning
};