/**
 * @fileoverview Redis configuration for the notification service
 * 
 * Requirements Addressed:
 * - Redis Configuration (Technical Specification/System Design/Data Storage Components)
 *   Implements Redis configuration for caching and message queuing to optimize 
 *   performance and scalability.
 * 
 * Human Tasks:
 * - Set up Redis server in production environment
 * - Configure Redis password in environment variables
 * - Set up Redis cluster if high availability is required
 * - Configure Redis persistence settings based on data durability requirements
 * - Set up Redis monitoring and alerting
 */

// ioredis v5.3.1
import Redis from 'ioredis';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { logger } from '../../shared/utils/logger';

/**
 * Redis configuration options based on environment variables
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    // Maximum retry delay is 30 seconds
    const delay = Math.min(times * 1000, 30000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000, // 10 seconds
  disconnectTimeout: 2000, // 2 seconds
  keepAlive: 30000, // 30 seconds
  enableOfflineQueue: true,
  lazyConnect: true // Connect only when needed
};

/**
 * Redis client instance
 */
export const redisClient = new Redis(redisConfig);

/**
 * Initializes the Redis client with event listeners for connection management
 */
export const initializeRedis = (): void => {
  // Connection successful event
  redisClient.on('connect', () => {
    logger.logInfo('Successfully connected to Redis server');
  });

  // Ready event (connection is ready to accept commands)
  redisClient.on('ready', () => {
    logger.logInfo('Redis client is ready to accept commands');
  });

  // Error event
  redisClient.on('error', (err: Error) => {
    logger.logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Redis connection error',
      details: {
        error: err.message,
        stack: err.stack,
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
      }
    });
  });

  // Connection closed event
  redisClient.on('close', () => {
    logger.logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Redis connection closed',
      details: {
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
      }
    });
  });

  // End event (client is permanently disconnected)
  redisClient.on('end', () => {
    logger.logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Redis connection ended',
      details: {
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
      }
    });
  });

  // Attempt to establish connection
  redisClient.connect().catch((err: Error) => {
    logger.logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to establish Redis connection',
      details: {
        error: err.message,
        stack: err.stack,
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
      }
    });
  });
};