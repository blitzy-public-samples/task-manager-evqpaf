/**
 * @fileoverview Database Configuration for User Service
 * 
 * Requirements Addressed:
 * - Database Configuration (Technical Specification/System Design/Database Design)
 *   Ensures proper configuration of the database connection for the User Service,
 *   including connection pooling, retries, and ORM integration.
 * 
 * Human Tasks:
 * - Ensure all required environment variables are properly set in the deployment environment:
 *   - DB_HOST: Database host address
 *   - DB_PORT: Database port number
 *   - DB_USER: Database username
 *   - DB_PASSWORD: Database password
 *   - DB_NAME: Database name
 * - Verify database user has appropriate permissions
 * - Configure database backup and monitoring solutions
 * - Review connection pool settings based on load testing results
 */

// pg v8.10.0 - PostgreSQL client
import { Pool } from 'pg';

// sequelize v6.32.1 - ORM for database operations
import { Sequelize, Options } from 'sequelize';

// Internal imports
import { UserModel } from '../models/user.model';

/**
 * Database configuration object containing connection parameters and pool settings.
 * Values are loaded from environment variables for security and flexibility across environments.
 */
const DATABASE_CONFIG: Options = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    
    // Connection pool configuration
    pool: {
        max: 10,        // Maximum number of connection instances to keep in pool
        min: 0,         // Minimum number of connection instances to keep in pool
        acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
        idle: 10000     // Maximum time (ms) that a connection can be idle before being released
    },

    // Additional Sequelize options for production environment
    logging: false,     // Disable SQL query logging in production
    retry: {           // Configure connection retry behavior
        max: 3,        // Maximum number of connection retries
        timeout: 5000  // Timeout between retries in milliseconds
    },
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        statement_timeout: 10000, // Timeout for queries (10 seconds)
        idle_in_transaction_session_timeout: 30000 // Timeout for idle transactions (30 seconds)
    }
};

/**
 * Initializes the database connection using Sequelize and configures the User model.
 * Implements connection pooling and retry mechanisms for robust database connectivity.
 * 
 * @returns Promise<Sequelize> A configured Sequelize instance representing the database connection
 * @throws Error if database connection cannot be established
 */
export const initializeDatabase = async (): Promise<Sequelize> => {
    try {
        // Create Sequelize instance with configuration
        const sequelize = new Sequelize(DATABASE_CONFIG);

        // Test the database connection
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Initialize models
        // Note: Add additional models here as they are created
        UserModel.init(sequelize);

        // Sync database schema
        // In production, migrations should be used instead of sync
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            console.log('Database schema synchronized successfully.');
        }

        return sequelize;
    } catch (error) {
        console.error('Unable to initialize database:', error);
        throw error;
    }
};