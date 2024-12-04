/**
 * Database seed file for creating the initial admin user
 * 
 * Human Tasks:
 * - Review and update admin user credentials before deployment
 * - Ensure bcrypt salt rounds are configured appropriately for the environment
 * - Verify database connection configuration
 * - Ensure proper access controls are in place for the admin user
 */

// bcrypt v5.1.0
import * as bcrypt from 'bcrypt';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { validateSchema } from '../../shared/validators/common.validator';
import { logger } from '../../shared/utils/logger';
import * as Joi from 'joi';

// Initial admin user configuration
const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'securepassword',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
} as const;

// Validation schema for admin user
const adminUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('admin').required()
});

/**
 * Seeds the database with an initial admin user
 * 
 * Requirement Addressed: Initial Data Seeding
 * Location: Technical Specification/System Design/Data Management Strategy
 * Description: Ensures the database is seeded with essential data, such as an admin user,
 * to facilitate initial system setup and access.
 * 
 * @param db - Database connection instance
 * @returns Promise<void>
 */
export const seedAdminUser = async (db: any): Promise<void> => {
  try {
    // Validate admin user data against schema
    const validationError = validateSchema(ADMIN_USER, adminUserSchema);
    if (validationError) {
      logger.logError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Admin user validation failed',
        details: validationError
      });
      process.exit(1);
    }

    // Check if admin user already exists
    const existingUser = await db('users')
      .where('email', ADMIN_USER.email)
      .first();

    if (existingUser) {
      logger.logInfo('Admin user already exists, skipping seed');
      return;
    }

    // Hash password with bcrypt (12 rounds for production-grade security)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, saltRounds);

    // Create admin user record
    const [userId] = await db('users')
      .insert({
        email: ADMIN_USER.email,
        password_hash: hashedPassword,
        first_name: ADMIN_USER.firstName,
        last_name: ADMIN_USER.lastName,
        role: ADMIN_USER.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning('id');

    if (!userId) {
      throw new Error('Failed to create admin user');
    }

    logger.logInfo(`Admin user created successfully with ID: ${userId}`);

  } catch (error) {
    logger.logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to seed admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
};