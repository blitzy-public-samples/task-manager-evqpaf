/**
 * @fileoverview Project data validation logic
 * 
 * Requirement Addressed: Project Data Validation
 * Location: Technical Specification/System Design/Data Management Strategy
 * Description: Implements validation logic to ensure project data conforms 
 * to the expected schema and business rules.
 */

// joi v17.6.0
import * as Joi from 'joi';
import { validateSchema } from '../../../shared/validators/common.validator';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import { ErrorResponse } from '../../../shared/types/common.types';

/**
 * Project data validation schema
 * Defines the expected structure and validation rules for project data
 */
const projectSchema = Joi.object({
    // Project identifier - must be a valid UUID
    id: Joi.string().uuid().optional(),

    // Project name - required, between 3 and 100 characters
    name: Joi.string().min(3).max(100).required()
        .messages({
            'string.min': 'Project name must be at least 3 characters long',
            'string.max': 'Project name cannot exceed 100 characters',
            'any.required': 'Project name is required'
        }),

    // Project description - optional, max 1000 characters
    description: Joi.string().max(1000).allow('').optional()
        .messages({
            'string.max': 'Project description cannot exceed 1000 characters'
        }),

    // Project status - must be one of the valid statuses
    status: Joi.string().valid('ACTIVE', 'ARCHIVED', 'DRAFT', 'DELETED').required()
        .messages({
            'any.only': 'Invalid project status',
            'any.required': 'Project status is required'
        }),

    // Creation date - must be a valid ISO date string
    createdAt: Joi.date().iso().optional(),

    // Last update date - must be a valid ISO date string
    updatedAt: Joi.date().iso().optional(),

    // Owner ID - must be a valid UUID
    ownerId: Joi.string().uuid().required()
        .messages({
            'string.guid': 'Invalid owner ID format',
            'any.required': 'Owner ID is required'
        }),

    // Team members - array of UUIDs
    teamMembers: Joi.array().items(
        Joi.string().uuid().messages({
            'string.guid': 'Invalid team member ID format'
        })
    ).unique().optional(),

    // Project settings - object with specific configuration
    settings: Joi.object({
        isPublic: Joi.boolean().required(),
        allowComments: Joi.boolean().default(true),
        tags: Joi.array().items(Joi.string().max(50)).unique().optional()
    }).optional()
}).strict(); // Prevents additional properties not defined in the schema

/**
 * Validates project data against the defined schema
 * 
 * @param projectData - The project data to validate
 * @returns ErrorResponse if validation fails, null otherwise
 */
export const validateProject = (projectData: any): ErrorResponse | null => {
    // Use the common validator to validate the project data against our schema
    const validationResult = validateSchema(projectData, projectSchema);

    // If validation fails, enhance the error response with project-specific context
    if (validationResult) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Project validation failed',
            details: validationResult.details,
            statusCode: STATUS_CODES.BAD_REQUEST
        };
    }

    return null;
};