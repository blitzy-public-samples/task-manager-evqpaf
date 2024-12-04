/**
 * @fileoverview Common validation utilities for backend services
 * 
 * Requirement Addressed: Data Validation
 * Location: Technical Specification/System Design/Data Management Strategy
 * Description: Implements reusable validation logic to ensure data integrity 
 * and compliance with business rules across backend services.
 */

// joi v17.6.0
import * as Joi from 'joi';
import { ERROR_CODES } from '../constants/error-codes';
import { STATUS_CODES } from '../constants/status-codes';
import { ErrorResponse } from '../types/common.types';

/**
 * Validates a data object against a provided Joi schema and returns an error response if validation fails.
 * 
 * @param data - The data object to validate
 * @param schema - The Joi schema to validate against
 * @returns An ErrorResponse object if validation fails, null otherwise
 */
export const validateSchema = (
    data: any,
    schema: Joi.Schema
): ErrorResponse | null => {
    // Validate the data against the schema with all options enabled
    const validationResult = schema.validate(data, {
        abortEarly: false, // Collect all errors instead of stopping at first error
        allowUnknown: false, // Don't allow unknown keys
        stripUnknown: false, // Don't remove unknown keys
        presence: 'required' // Require all keys by default
    });

    // If validation fails, construct and return an error response
    if (validationResult.error) {
        const errorResponse: ErrorResponse = {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed for the provided data',
            details: validationResult.error.details.map(detail => ({
                path: detail.path,
                message: detail.message,
                type: detail.type
            }))
        };

        // Add HTTP status code to the error object
        (errorResponse as any).statusCode = STATUS_CODES.BAD_REQUEST;

        return errorResponse;
    }

    // Return null if validation succeeds
    return null;
};