/**
 * @fileoverview Migration file for creating the tasks table
 * 
 * Requirement Addressed: Database Schema Design
 * Location: Technical Specification/System Design/Database Design/Schema Design
 * Description: Defines the schema for the 'tasks' table, including fields, 
 * constraints, and relationships with other tables.
 * 
 * Human Tasks:
 * - Ensure database user has sufficient privileges to create tables and foreign keys
 * - Verify that 'users' and 'projects' tables exist before running this migration
 * - Review and adjust index strategies based on query patterns in production
 * - Consider setting up database monitoring for table growth and performance
 */

// knex v2.4.0
import { Knex } from 'knex';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { handleError } from '../../shared/utils/error-handler';

/**
 * Creates the tasks table with all necessary columns, constraints, and relationships
 */
export async function up(knex: Knex): Promise<void> {
    try {
        await knex.schema.createTable('tasks', (table) => {
            // Primary key
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

            // Basic task information
            table.string('title', 255).notNullable();
            table.text('description');
            table.timestamp('due_date');

            // Foreign key relationships
            table.uuid('creator_id')
                .notNullable()
                .references('id')
                .inTable('users')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');

            table.uuid('assignee_id')
                .references('id')
                .inTable('users')
                .onDelete('SET NULL')
                .onUpdate('CASCADE');

            table.uuid('project_id')
                .notNullable()
                .references('id')
                .inTable('projects')
                .onDelete('CASCADE')
                .onUpdate('CASCADE');

            // Task status and priority
            table.enum('status', [
                'TODO',
                'IN_PROGRESS',
                'REVIEW',
                'DONE',
                'ARCHIVED'
            ]).notNullable().defaultTo('TODO');

            table.enum('priority', [
                'LOW',
                'MEDIUM',
                'HIGH',
                'URGENT'
            ]).notNullable().defaultTo('MEDIUM');

            // Timestamps
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

            // Indexes for performance optimization
            table.index(['status', 'priority'], 'idx_tasks_status_priority');
            table.index('due_date', 'idx_tasks_due_date');
            table.index('creator_id', 'idx_tasks_creator');
            table.index('assignee_id', 'idx_tasks_assignee');
            table.index('project_id', 'idx_tasks_project');
        });

        // Create trigger for automatically updating updated_at timestamp
        await knex.raw(`
            CREATE TRIGGER update_tasks_updated_at
                BEFORE UPDATE ON tasks
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

    } catch (error) {
        const err = error as Error;
        handleError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create tasks table: ${err.message}`,
            details: err.stack
        }, {
            status: (code: number) => ({ status: code }),
            json: (response: any) => response
        } as any);
        throw err;
    }
}

/**
 * Drops the tasks table and related objects
 */
export async function down(knex: Knex): Promise<void> {
    try {
        await knex.schema.dropTableIfExists('tasks');
    } catch (error) {
        const err = error as Error;
        handleError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to drop tasks table: ${err.message}`,
            details: err.stack
        }, {
            status: (code: number) => ({ status: code }),
            json: (response: any) => response
        } as any);
        throw err;
    }
}