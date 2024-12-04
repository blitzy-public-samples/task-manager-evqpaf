/**
 * @fileoverview Defines standardized error codes used across backend services
 * 
 * Requirement Addressed: Error Code Consistency
 * Location: Technical Specification/System Design/Error Handling Standards
 * Description: This file implements standardized error codes to ensure consistent 
 * error handling and response formatting across all backend services.
 */

/**
 * Centralized error codes used across the application for consistent error handling
 * 
 * @constant
 * @type {Object.<string, string>}
 */
export const ERROR_CODES = {
    /**
     * Used when authentication fails (e.g., invalid credentials, expired tokens)
     */
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',

    /**
     * Used when an authenticated user lacks permission to access a resource
     */
    AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',

    /**
     * Used when a requested resource cannot be found in the system
     */
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

    /**
     * Used when request validation fails (e.g., invalid input data, missing required fields)
     */
    VALIDATION_ERROR: 'VALIDATION_ERROR',

    /**
     * Used for unexpected server errors or system failures
     */
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

// Type definition to ensure type safety when using error codes
type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Make the type available for external use
export type { ErrorCode };