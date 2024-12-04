/**
 * Database migration script for creating the notifications table
 * 
 * Requirement Addressed: Database Schema Design
 * Location: Technical Specification/System Design/Database Design/Schema Design
 * Description: Implements the schema for the notifications table, including fields
 * for notification content, type, user association, and timestamps.
 * 
 * Human Tasks:
 * - Verify database user has sufficient privileges for table creation
 * - Ensure foreign key constraints are properly configured in the database
 * - Review and adjust index configurations based on expected query patterns
 * - Validate that the database backup strategy is in place before running migration
 */

// knex v2.4.2
import { Knex } from 'knex';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { logger } from '../../shared/utils/logger';
import { handleError } from '../../shared/utils/error-handler';

/**
 * Creates the notifications table in the database
 * 
 * @param knex - The Knex instance for database operations
 * @returns A promise that resolves when the table is created
 */
export async function up(knex: Knex): Promise<void> {
    try {
        await knex.schema.createTable('notifications', (table) => {
            // Primary key
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

            // Foreign key reference to users table
            table.uuid('user_id')
                .notNullable()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
                .onUpdate('CASCADE')
                .index();

            // Notification type (e.g., 'TASK_ASSIGNED', 'DUE_DATE_REMINDER', etc.)
            table.string('type', 50).notNullable().index();

            // Notification content stored as JSON to support flexible content structure
            table.jsonb('content').notNullable();

            // Read status flag
            table.boolean('is_read').notNullable().defaultTo(false).index();

            // Timestamps for record tracking
            table.timestamp('created_at', { useTz: true })
                .notNullable()
                .defaultTo(knex.fn.now());
            table.timestamp('updated_at', { useTz: true })
                .notNullable()
                .defaultTo(knex.fn.now());

            // Composite index for common query patterns
            table.index(['user_id', 'is_read', 'created_at']);
        });

        // Create an update trigger for the updated_at timestamp
        await knex.raw(`
            CREATE TRIGGER update_notifications_updated_at
            BEFORE UPDATE ON notifications
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);

    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to create notifications table',
            details: error
        });
        throw error;
    }
}

/**
 * Drops the notifications table from the database
 * 
 * @param knex - The Knex instance for database operations
 * @returns A promise that resolves when the table is dropped
 */
export async function down(knex: Knex): Promise<void> {
    try {
        // Drop the trigger first
        await knex.raw(`
            DROP TRIGGER IF EXISTS update_notifications_updated_at
            ON notifications;
        `);

        // Drop the table
        await knex.schema.dropTableIfExists('notifications');

    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to drop notifications table',
            details: error
        });
        throw error;
    }
}