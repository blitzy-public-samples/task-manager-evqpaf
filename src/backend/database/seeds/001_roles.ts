/**
 * @fileoverview Database seed file for roles table
 * 
 * Requirement Addressed: Database Seeding
 * Location: Technical Specification/System Design/Database Design/Data Management Strategy
 * Description: Provides initial data for the 'roles' table to ensure the system has 
 * predefined roles available for user assignment.
 * 
 * Human Tasks:
 * - Verify role names and descriptions match organizational requirements
 * - Ensure database user has sufficient privileges for seeding operations
 * - Review role hierarchy and permissions alignment with system requirements
 */

// knex v2.4.0
import { Knex } from 'knex';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { handleError } from '../../shared/utils/error-handler';
import { logger } from '../../shared/utils/logger';

/**
 * Interface defining the structure of a role record
 */
interface RoleRecord {
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Predefined roles with their descriptions
 */
const predefinedRoles: Omit<RoleRecord, 'created_at' | 'updated_at'>[] = [
  {
    name: 'Admin',
    description: 'System administrator with full access to all features and settings'
  },
  {
    name: 'Project Manager',
    description: 'Manages projects, teams, and has access to project-related features'
  },
  {
    name: 'Team Member',
    description: 'Regular team member with standard access to project tasks and collaboration features'
  }
];

/**
 * Seeds the roles table with predefined roles
 * 
 * @param knex - The Knex instance for database operations
 * @returns Promise that resolves when seeding is complete
 */
export async function seed(knex: Knex): Promise<void> {
  try {
    // Log the start of seeding operation
    logger.logInfo('Starting roles table seeding');

    // First, ensure the roles table is empty to prevent duplicate entries
    await knex('roles').del();
    logger.logInfo('Cleared existing roles data');

    // Prepare the role records with timestamps
    const timestamp = new Date();
    const roleRecords: RoleRecord[] = predefinedRoles.map(role => ({
      ...role,
      created_at: timestamp,
      updated_at: timestamp
    }));

    // Insert the predefined roles
    await knex('roles').insert(roleRecords);
    logger.logInfo(`Successfully seeded ${roleRecords.length} roles`);

  } catch (error) {
    // Handle any errors that occur during seeding
    const errorResponse = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Failed to seed roles table',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
      }
    };

    logger.logError(errorResponse);
    throw error; // Re-throw to let Knex handle the failed migration
  }
}