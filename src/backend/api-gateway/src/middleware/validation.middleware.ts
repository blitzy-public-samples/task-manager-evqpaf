/**
 * @fileoverview Middleware for validating incoming API requests against predefined schemas
 * 
 * Requirement Addressed: Request Validation
 * Location: Technical Specification/System Design/API Design/Interface Specifications
 * Description: Implements middleware to validate incoming API requests against predefined 
 * schemas, ensuring data integrity and compliance with business rules.
 * 
 * Human Tasks:
 * - Ensure Joi validation schemas are properly defined for all API endpoints
 * - Review validation error messages for clarity and security
 * - Configure validation options based on environment requirements
 * - Document schema validation requirements for API consumers
 */

// express v4.18.2
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi'; // joi v17.6.0
import { validateSchema } from '../../../shared/validators/common.validator';
import { handleError } from '../../../shared/utils/error-handler';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';

/**
 * Middleware function that validates incoming API requests against a predefined Joi schema.
 * Validates request body, query parameters, or URL parameters based on the provided schema.
 * 
 * @param schema - The Joi schema to validate against
 * @returns Express middleware function that performs validation
 */
export const validationMiddleware = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Determine which part of the request to validate based on request method
        let dataToValidate: any;
        
        switch (req.method) {
            case 'GET':
                // For GET requests, validate query parameters
                dataToValidate = req.query;
                break;
            case 'DELETE':
                // For DELETE requests, validate URL parameters
                dataToValidate = req.params;
                break;
            default:
                // For POST/PUT/PATCH requests, validate request body
                // Also include URL parameters if present
                dataToValidate = {
                    ...req.body,
                    ...(Object.keys(req.params).length > 0 && { params: req.params })
                };
                break;
        }

        // Validate the data against the provided schema
        const validationError = validateSchema(dataToValidate, schema);

        if (validationError) {
            // If validation fails, handle the error with standardized error response
            handleError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'Request validation failed',
                details: {
                    validationErrors: validationError.details,
                    statusCode: STATUS_CODES.BAD_REQUEST
                }
            }, res);
            return;
        }

        // If validation succeeds, attach validated data to request object
        // This ensures that downstream handlers work with validated data
        if (req.method === 'GET') {
            req.query = dataToValidate;
        } else if (req.method === 'DELETE') {
            req.params = dataToValidate;
        } else {
            req.body = dataToValidate;
        }

        // Proceed to next middleware or route handler
        next();
    };
};