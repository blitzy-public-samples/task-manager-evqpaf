/**
 * @fileoverview Database configuration for the Project Service
 * 
 * Requirements Addressed:
 * - Database Configuration (Technical Specification/System Design/Database Design)
 *   Defines the database connection settings and ORM configuration for the Project Service.
 * 
 * Human Tasks:
 * - Set up PostgreSQL database instance with appropriate credentials
 * - Configure database backup and recovery procedures
 * - Set up database monitoring and alerting
 * - Implement database connection pooling optimization based on load testing results
 */

// sequelize v6.32.1
import { Sequelize, Options } from 'sequelize';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import { logger } from '../../../shared/utils/logger';

/**
 * Database configuration options based on environment
 */
const dbConfig: Options = {
  database: process.env.DB_NAME || 'task_management_projects',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    min: parseInt(process.env.DB_POOL_MIN || '5', 10),
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    connectTimeout: 60000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  }
};

/**
 * Sequelize instance for database operations
 */
export const sequelizeInstance = new Sequelize(dbConfig);

/**
 * Initializes the database connection and sets up the ORM
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test database connection
    await sequelizeInstance.authenticate();
    
    // Sync models with database
    if (process.env.NODE_ENV === 'development') {
      await sequelizeInstance.sync({ alter: true });
    } else {
      // In production, migrations should be used instead of sync
      await sequelizeInstance.sync({ force: false });
    }

    logger.logInfo('Database connection established successfully');
  } catch (error) {
    logger.logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to initialize database connection',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
    });
    
    // Re-throw the error to be handled by the application error handler
    throw error;
  }
};