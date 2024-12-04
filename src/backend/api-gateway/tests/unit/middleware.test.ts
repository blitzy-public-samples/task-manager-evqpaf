// jest v29.0.0
// supertest v6.3.0
import { Request, Response, NextFunction } from 'express';
import supertest from 'supertest';
import { authMiddleware } from '../../src/middleware/auth.middleware';
import errorMiddleware from '../../src/middleware/error.middleware';
import { loggingMiddleware } from '../../src/middleware/logging.middleware';
import { validationMiddleware } from '../../src/middleware/validation.middleware';
import { logger } from '../../src/utils/logger';
import { handleError } from '../../../shared/utils/error-handler';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';

/**
 * Human Tasks:
 * - Configure test environment variables for JWT secret and token expiration
 * - Set up test database if required for integration tests
 * - Configure test logging levels and output
 * - Review test coverage requirements
 */

// Mock dependencies
jest.mock('../../src/utils/logger');
jest.mock('../../../shared/utils/error-handler');

describe('Middleware Unit Tests', () => {
  // Common test variables
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Initialize mock request and response objects
    mockRequest = {
      headers: {},
      body: {},
      query: {},
      params: {},
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      getHeaders: jest.fn().mockReturnValue({})
    };

    nextFunction = jest.fn();
  });

  describe('authMiddleware', () => {
    /**
     * Requirement Addressed: Middleware Unit Testing
     * Tests authentication middleware for handling valid and invalid JWT tokens
     */
    
    it('should pass authentication with valid token', async () => {
      // Arrange
      const validToken = 'Bearer valid.jwt.token';
      mockRequest.headers = { authorization: validToken };
      const auth = authMiddleware();

      // Act
      await auth(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
    });

    it('should fail authentication with invalid token', async () => {
      // Arrange
      const invalidToken = 'Bearer invalid.token';
      mockRequest.headers = { authorization: invalidToken };
      const auth = authMiddleware();

      // Act
      await auth(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.AUTHENTICATION_FAILED,
          message: expect.any(String)
        }),
        mockResponse
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail authentication with missing token', async () => {
      // Arrange
      const auth = authMiddleware();

      // Act
      await auth(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.AUTHENTICATION_FAILED,
          message: 'No authorization token provided'
        }),
        mockResponse
      );
    });
  });

  describe('errorMiddleware', () => {
    /**
     * Requirement Addressed: Middleware Unit Testing
     * Tests error handling middleware for proper error formatting and logging
     */

    it('should handle standard Error objects', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(logger.logError).toHaveBeenCalled();
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Test error'
        }),
        mockResponse
      );
    });

    it('should handle validation errors', () => {
      // Arrange
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';

      // Act
      errorMiddleware(validationError, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid request data'
        }),
        mockResponse
      );
    });
  });

  describe('loggingMiddleware', () => {
    /**
     * Requirement Addressed: Middleware Unit Testing
     * Tests logging middleware for request and response logging
     */

    it('should log request details', () => {
      // Arrange
      mockRequest.method = 'POST';
      mockRequest.url = '/test';
      mockRequest.headers = { 'user-agent': 'test-agent' };

      // Act
      loggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('"type":"REQUEST"')
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should log response details', () => {
      // Arrange
      mockResponse.statusCode = STATUS_CODES.OK;

      // Act
      loggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      mockResponse.end!();

      // Assert
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('"type":"RESPONSE"')
      );
    });

    it('should sanitize sensitive headers', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer token',
        'user-agent': 'test-agent',
        cookie: 'session=123'
      };

      // Act
      loggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
      expect(logger.logInfo).not.toHaveBeenCalledWith(
        expect.stringContaining('Bearer token')
      );
    });
  });

  describe('validationMiddleware', () => {
    /**
     * Requirement Addressed: Middleware Unit Testing
     * Tests validation middleware for request data validation
     */

    it('should validate request body for POST requests', () => {
      // Arrange
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null })
      };
      mockRequest.method = 'POST';
      mockRequest.body = { test: 'data' };
      const validate = validationMiddleware(schema);

      // Act
      validate(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(schema.validate).toHaveBeenCalledWith(
        mockRequest.body,
        expect.any(Object)
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle validation errors', () => {
      // Arrange
      const schema = {
        validate: jest.fn().mockReturnValue({
          error: {
            details: [{ message: 'Invalid data', path: ['test'], type: 'string.base' }]
          }
        })
      };
      mockRequest.method = 'POST';
      mockRequest.body = { test: 123 };
      const validate = validationMiddleware(schema);

      // Act
      validate(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Request validation failed'
        }),
        mockResponse
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should validate query parameters for GET requests', () => {
      // Arrange
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null })
      };
      mockRequest.method = 'GET';
      mockRequest.query = { filter: 'test' };
      const validate = validationMiddleware(schema);

      // Act
      validate(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(schema.validate).toHaveBeenCalledWith(
        mockRequest.query,
        expect.any(Object)
      );
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});