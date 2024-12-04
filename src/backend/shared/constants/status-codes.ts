/**
 * @fileoverview HTTP Status Codes Constants
 * 
 * Requirement Addressed: HTTP Status Code Consistency
 * Location: Technical Specification/System Design/API Design/API Response Format
 * Description: Defines standardized HTTP status codes to ensure consistent API 
 * response handling across all backend services.
 */

/**
 * Centralized HTTP status codes used across backend services for consistent
 * API response handling.
 * 
 * @constant
 * @type {Readonly<{[key: string]: number}>}
 */
export const STATUS_CODES = Object.freeze({
    /** Success - Request has succeeded */
    OK: 200,
    
    /** Success - Resource has been created */
    CREATED: 201,
    
    /** Client Error - Request has invalid syntax */
    BAD_REQUEST: 400,
    
    /** Client Error - Request requires authentication */
    UNAUTHORIZED: 401,
    
    /** Client Error - Server understood request but refuses to authorize it */
    FORBIDDEN: 403,
    
    /** Client Error - Server cannot find requested resource */
    NOT_FOUND: 404,
    
    /** Server Error - Server encountered an unexpected condition */
    INTERNAL_SERVER_ERROR: 500
}) as const;