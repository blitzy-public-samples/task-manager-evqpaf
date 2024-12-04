// knex v2.4.0
import { Knex } from 'knex';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { handleError } from '../../shared/utils/error-handler';

/**
 * Human Tasks:
 * - Ensure PostgreSQL database is properly configured and accessible
 * - Verify database user has sufficient privileges for table creation
 * - Review and adjust any database-specific settings (e.g., character set, collation)
 * - Consider adding appropriate database indexes based on query patterns
 * - Set up database backup strategy before running migrations
 */

/**
 * Creates the 'users' table in the database.
 * 
 * Requirement Addressed: Database Schema Design
 * Location: Technical Specification/System Design/Database Design/Schema Design
 * Description: Implements the core users table with all required fields and constraints
 * for user management functionality.
 */
export async function up(knex: Knex): Promise<void> {
    try {
        await knex.schema.createTable('users', (table) => {
            // Primary key using UUID for better distribution and security
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

            // Authentication fields
            table.string('email', 255).notNullable().unique()
                .comment('User email address for authentication and communication');
            table.string('password_hash', 255).notNullable()
                .comment('Argon2id hashed password');

            // Profile information
            table.string('first_name', 100).notNullable()
                .comment('User first name');
            table.string('last_name', 100).notNullable()
                .comment('User last name');

            // Account status and timestamps
            table.boolean('is_active').notNullable().defaultTo(true)
                .comment('Indicates if the user account is active');
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
                .comment('Timestamp of user account creation');
            table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
                .comment('Timestamp of last user account update');

            // Additional security fields
            table.timestamp('last_login').nullable()
                .comment('Timestamp of last successful login');
            table.integer('failed_login_attempts').notNullable().defaultTo(0)
                .comment('Count of consecutive failed login attempts');
            table.timestamp('password_changed_at').nullable()
                .comment('Timestamp of last password change');
            table.string('reset_token_hash', 255).nullable()
                .comment('Hashed token for password reset');
            table.timestamp('reset_token_expires_at').nullable()
                .comment('Expiration timestamp for password reset token');

            // Indexes for performance
            table.index(['email'], 'idx_users_email');
            table.index(['is_active'], 'idx_users_is_active');
            table.index(['created_at'], 'idx_users_created_at');
        });

        // Create a trigger to automatically update the updated_at timestamp
        await knex.raw(`
            CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

    } catch (error) {
        handleError({
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Failed to create users table',
            details: {
                error: error instanceof Error ? error.message : 'Unknown error',
                statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
            }
        }, null as any); // Type assertion needed as we don't have Response object in migrations
        throw error;
    }
}

/**
 * Drops the 'users' table from the database.
 * 
 * Requirement Addressed: Database Schema Design
 * Location: Technical Specification/System Design/Database Design/Schema Design
 * Description: Provides rollback capability for the users table creation.
 */
export async function down(knex: Knex): Promise<void> {
    try {
        // Drop the trigger first
        await knex.raw(`DROP TRIGGER IF EXISTS update_users_updated_at ON users`);
        
        // Then drop the table
        await knex.schema.dropTableIfExists('users');

    } catch (error) {
        handleError({
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Failed to drop users table',
            details: {
                error: error instanceof Error ? error.message : 'Unknown error',
                statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
            }
        }, null as any); // Type assertion needed as we don't have Response object in migrations
        throw error;
    }
}