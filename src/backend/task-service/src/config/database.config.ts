/**
 * @fileoverview Database configuration for Task Service
 * 
 * Requirements Addressed:
 * - Database Configuration (Technical Specification/System Design/Database Design)
 *   Defines the database connection settings, including host, port, credentials,
 *   and pooling options, to ensure reliable and efficient database access.
 * 
 * Human Tasks:
 * - Set up environment variables for database configuration
 * - Configure database firewall rules and network access
 * - Set up database backup and recovery procedures
 * - Monitor connection pool metrics in production
 */

// pg v8.10.0
import { Pool } from 'pg';
import { logError, logInfo } from '../../shared/utils/logger';

/**
 * Database configuration interface defining required connection parameters
 */
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  poolSize: number;
}

/**
 * Load and validate database configuration from environment variables
 */
const getDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10)
  };

  // Validate required configuration
  const missingConfig = Object.entries(config)
    .filter(([key, value]) => !value && key !== 'poolSize')
    .map(([key]) => key);

  if (missingConfig.length > 0) {
    const error = `Missing required database configuration: ${missingConfig.join(', ')}`;
    logError({
      code: 'DATABASE_CONFIG_ERROR',
      message: error,
      details: missingConfig
    });
    throw new Error(error);
  }

  return config;
};

/**
 * Initializes the database connection pool using the provided configuration.
 * Implements connection pooling for efficient database connections management.
 * 
 * @returns Database pool instance
 */
export const initializeDatabase = (): Pool => {
  try {
    const config = getDatabaseConfig();
    
    const pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      max: config.poolSize, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true // Enforce SSL in production
      } : undefined
    });

    // Handle pool errors
    pool.on('error', (err) => {
      logError({
        code: 'DATABASE_POOL_ERROR',
        message: 'Unexpected error on idle client',
        details: err
      });
    });

    // Test database connection
    pool.query('SELECT NOW()')
      .then(() => {
        logInfo('Database connection pool initialized successfully');
      })
      .catch((err) => {
        logError({
          code: 'DATABASE_CONNECTION_ERROR',
          message: 'Failed to connect to database',
          details: err
        });
        throw err;
      });

    return pool;
  } catch (error) {
    logError({
      code: 'DATABASE_INITIALIZATION_ERROR',
      message: 'Failed to initialize database connection pool',
      details: error
    });
    throw error;
  }
};