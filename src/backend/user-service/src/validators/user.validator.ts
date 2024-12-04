/**
 * @fileoverview User validation logic for the User Service
 * 
 * Requirement Addressed: User Data Validation
 * Location: Technical Specification/System Design/Data Management Strategy
 * Description: Implements validation logic for user-related data to ensure 
 * compliance with business rules and data integrity.
 * 
 * Human Tasks:
 * - Ensure email domain restrictions are configured according to organization policy
 * - Verify password complexity requirements align with security standards
 * - Confirm role IDs are properly synchronized with the role management system
 */

// joi v17.6.0
import * as Joi from 'joi';
import { validateSchema } from '../../../shared/validators/common.validator';
import { ErrorResponse } from '../../../shared/types/common.types';
import { UserModel } from '../models/user.model';

/**
 * Joi schema for validating user data.
 * Enforces business rules and data integrity requirements.
 */
const userSchema = Joi.object({
    id: Joi.string()
        .uuid()
        .optional()
        .description('Unique identifier for the user'),

    email: Joi.string()
        .email({ tlds: { allow: true } })
        .required()
        .max(255)
        .description('User email address used for authentication'),

    passwordHash: Joi.string()
        .required()
        .min(60)
        .max(60)
        .description('Bcrypt hash of user password'),

    firstName: Joi.string()
        .required()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s-']+$/)
        .description('User first name'),

    lastName: Joi.string()
        .required()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s-']+$/)
        .description('User last name'),

    isActive: Joi.boolean()
        .required()
        .description('Flag indicating if the user account is active'),

    roleId: Joi.string()
        .uuid()
        .required()
        .description('ID of the role assigned to the user'),

    createdAt: Joi.date()
        .iso()
        .optional()
        .description('Timestamp of user creation'),

    updatedAt: Joi.date()
        .iso()
        .optional()
        .description('Timestamp of last user update')
});

/**
 * Validates user data against the defined schema and business rules.
 * 
 * @param userData - The user data object to validate
 * @returns ErrorResponse if validation fails, null otherwise
 */
export const validateUser = (userData: Partial<UserModel>): ErrorResponse | null => {
    // Validate the user data against the schema
    const validationResult = validateSchema(userData, userSchema);

    // If schema validation fails, return the error response
    if (validationResult) {
        return validationResult;
    }

    // Additional business rule validations
    const customValidationErrors: Array<{ path: string[]; message: string; type: string }> = [];

    // Validate email domain if organization policy requires specific domains
    if (userData.email && !isAllowedEmailDomain(userData.email)) {
        customValidationErrors.push({
            path: ['email'],
            message: 'Email domain not allowed by organization policy',
            type: 'custom.email'
        });
    }

    // Validate role ID against allowed roles
    if (userData.roleId && !isValidRole(userData.roleId)) {
        customValidationErrors.push({
            path: ['roleId'],
            message: 'Invalid role ID',
            type: 'custom.role'
        });
    }

    // If there are custom validation errors, return them in the error response
    if (customValidationErrors.length > 0) {
        return {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed for the provided user data',
            details: customValidationErrors
        };
    }

    return null;
};

/**
 * Validates if the email domain is allowed by organization policy.
 * This should be configured based on organization requirements.
 * 
 * @param email - The email address to validate
 * @returns boolean indicating if the email domain is allowed
 */
const isAllowedEmailDomain = (email: string): boolean => {
    // Extract domain from email
    const domain = email.split('@')[1].toLowerCase();

    // List of allowed domains - should be configured based on organization policy
    const allowedDomains = [
        'company.com',
        'subsidiary.com'
    ];

    return allowedDomains.includes(domain);
};

/**
 * Validates if the role ID exists in the system.
 * This should be synchronized with the role management system.
 * 
 * @param roleId - The role ID to validate
 * @returns boolean indicating if the role ID is valid
 */
const isValidRole = (roleId: string): boolean => {
    // List of valid role IDs - should be synchronized with role management system
    const validRoleIds = [
        '550e8400-e29b-41d4-a716-446655440000', // Admin
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Manager
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8', // User
    ];

    return validRoleIds.includes(roleId);
};