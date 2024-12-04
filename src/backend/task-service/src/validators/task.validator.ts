/**
 * @fileoverview Task validation logic for ensuring data integrity and compliance with business rules
 * 
 * Requirement Addressed: Task Validation
 * Location: Technical Specification/System Design/Data Management Strategy
 * Description: Implements validation logic to ensure task data integrity and compliance with business rules.
 */

// joi v17.6.0
import * as Joi from 'joi';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { validateSchema } from '../../shared/validators/common.validator';
import { ErrorResponse } from '../../shared/types/common.types';

/**
 * Joi schema for task validation defining the required structure and rules for task data
 */
const taskSchema = Joi.object({
    // Required fields
    title: Joi.string()
        .required()
        .min(1)
        .max(200)
        .trim()
        .messages({
            'string.empty': 'Task title cannot be empty',
            'string.min': 'Task title must be at least 1 character long',
            'string.max': 'Task title cannot exceed 200 characters'
        }),

    description: Joi.string()
        .optional()
        .allow('')
        .max(2000)
        .trim()
        .messages({
            'string.max': 'Task description cannot exceed 2000 characters'
        }),

    dueDate: Joi.date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.base': 'Due date must be a valid date',
            'date.min': 'Due date cannot be in the past',
            'date.format': 'Due date must be in ISO format'
        }),

    priority: Joi.string()
        .required()
        .valid('LOW', 'MEDIUM', 'HIGH', 'URGENT')
        .messages({
            'any.only': 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT'
        }),

    status: Joi.string()
        .required()
        .valid('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')
        .messages({
            'any.only': 'Status must be one of: TODO, IN_PROGRESS, COMPLETED, BLOCKED'
        }),

    assigneeId: Joi.string()
        .optional()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'Invalid assignee ID format'
        }),

    tags: Joi.array()
        .items(Joi.string().trim().max(50))
        .optional()
        .max(10)
        .unique()
        .messages({
            'array.max': 'Cannot have more than 10 tags',
            'array.unique': 'Tags must be unique',
            'string.max': 'Each tag cannot exceed 50 characters'
        }),

    attachments: Joi.array()
        .items(Joi.string().uri())
        .optional()
        .max(20)
        .messages({
            'array.max': 'Cannot have more than 20 attachments',
            'string.uri': 'Attachment must be a valid URI'
        })
}).required();

/**
 * Validates a task object against predefined schema and business rules
 * 
 * @param taskData - The task data object to validate
 * @returns ErrorResponse if validation fails, null otherwise
 */
export const validateTask = (taskData: any): ErrorResponse | null => {
    // Use the common validator to validate against the task schema
    const validationError = validateSchema(taskData, taskSchema);

    if (validationError) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Task validation failed',
            details: validationError.details,
            statusCode: STATUS_CODES.BAD_REQUEST
        };
    }

    // Additional business rule validations can be added here
    // For example, checking if the assignee exists, if the due date conflicts with holidays, etc.

    return null;
};