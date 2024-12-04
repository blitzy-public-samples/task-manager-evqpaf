/**
 * Database Migration: Create Projects Table
 * 
 * Requirement Addressed: Database Schema Design
 * Location: Technical Specification/System Design/Database Design/Schema Design
 * Description: Defines the schema for the 'projects' table, including fields, 
 * constraints, and relationships with other tables.
 * 
 * Human Tasks:
 * - Ensure the 'users' and 'teams' tables exist before running this migration
 * - Verify database user has sufficient privileges for creating tables and foreign keys
 * - Review cascade delete settings for foreign key constraints based on business requirements
 * - Consider adding appropriate indexes based on query patterns
 */

// knex v2.4.0
import { Knex } from 'knex';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { logger } from '../../shared/utils/logger';

/**
 * Creates the 'projects' table with all necessary columns and constraints
 */
export async function up(knex: Knex): Promise<void> {
  try {
    logger.logInfo("Starting migration: Creating 'projects' table");

    await knex.schema.createTable('projects', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

      // Basic project information
      table.string('name', 255).notNullable();
      table.text('description');
      
      // Foreign keys
      table.uuid('manager_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.uuid('team_id')
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      // Project status and metadata
      table.enum('status', ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
        .notNullable()
        .defaultTo('ACTIVE');

      // Timestamps
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // Indexes
      table.index(['manager_id'], 'idx_projects_manager_id');
      table.index(['team_id'], 'idx_projects_team_id');
      table.index(['status'], 'idx_projects_status');
    });

    logger.logInfo("Successfully created 'projects' table");
  } catch (error) {
    logger.logError({
      code: 'MIGRATION_ERROR',
      message: "Failed to create 'projects' table",
      details: error,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
    });
    throw error;
  }
}

/**
 * Drops the 'projects' table
 */
export async function down(knex: Knex): Promise<void> {
  try {
    logger.logInfo("Starting rollback: Dropping 'projects' table");

    await knex.schema.dropTableIfExists('projects');

    logger.logInfo("Successfully dropped 'projects' table");
  } catch (error) {
    logger.logError({
      code: 'MIGRATION_ERROR',
      message: "Failed to drop 'projects' table",
      details: error,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
    });
    throw error;
  }
}