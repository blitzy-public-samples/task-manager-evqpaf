/**
 * @fileoverview Middleware for logging HTTP requests and responses in the API Gateway
 * 
 * Requirements Addressed:
 * - Centralized Logging (Technical Specification/System Design/System Monitoring)
 *   Implements centralized logging for HTTP requests and responses to ensure
 *   consistent monitoring and debugging capabilities.
 * 
 * Human Tasks:
 * - Review and adjust log levels based on environment requirements
 * - Configure log sampling rates for high-traffic environments
 * - Set up log monitoring alerts for specific HTTP status codes
 * - Ensure sensitive data is properly redacted in production logs
 */

// express v4.18.2
import { Request, Response, NextFunction } from 'express';
import { logInfo, logDebug } from '../../../shared/utils/logger';

/**
 * Sanitizes headers to remove sensitive information before logging
 * @param headers Request or response headers
 * @returns Sanitized headers object
 */
const sanitizeHeaders = (headers: Record<string, string | string[] | undefined>): Record<string, string | string[] | undefined> => {
  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Middleware function to log HTTP requests and responses
 * Provides detailed logging for monitoring and debugging purposes
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Attach timestamp to request object for response time calculation
  const startTime = Date.now();
  req.timestamp = startTime;

  // Log incoming request details
  logInfo(JSON.stringify({
    type: 'REQUEST',
    method: req.method,
    url: req.url,
    path: req.path,
    headers: sanitizeHeaders(req.headers),
    ip: req.ip,
    timestamp: new Date(startTime).toISOString()
  }));

  // Log debug information about request body and query parameters
  logDebug(JSON.stringify({
    type: 'REQUEST_DEBUG',
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date(startTime).toISOString()
  }));

  // Wrap response end method to log response details
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: string | undefined, callback?: (() => void) | undefined): Response {
    const responseTime = Date.now() - startTime;
    
    // Log response details
    logInfo(JSON.stringify({
      type: 'RESPONSE',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      headers: sanitizeHeaders(res.getHeaders()),
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    }));

    // Call original end method
    return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
  };

  // Continue to next middleware
  next();
};