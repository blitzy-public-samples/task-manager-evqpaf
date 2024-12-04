/**
 * @fileoverview Base Controller Interface Definition
 * 
 * Requirement Addressed: Standardized Controller Interfaces
 * Location: Technical Specification/System Architecture/Core Components
 * Description: Defines a standardized interface that all controllers must implement
 * to ensure consistency and maintainability across the backend system.
 */

// Third-party imports
import { Request, Response } from 'express'; // @types/express ^4.17.x

// Internal imports
import { STATUS_CODES } from '../constants/status-codes';
import { ERROR_CODES } from '../constants/error-codes';

/**
 * Base interface that defines the standard CRUD operations all controllers must implement.
 * This ensures a consistent structure across all controllers in the system.
 * 
 * @interface BaseController
 */
export interface BaseController {
    /**
     * Creates a new resource based on the request payload.
     * Controllers implementing this method should:
     * - Validate the request payload
     * - Create the resource in the database
     * - Return appropriate success/error response
     * 
     * @param {Request} req - Express request object containing the resource data
     * @param {Response} res - Express response object for sending the API response
     * @returns {Promise<void>} Resolves when the response has been sent
     */
    create(req: Request, res: Response): Promise<void>;

    /**
     * Retrieves a resource by its identifier.
     * Controllers implementing this method should:
     * - Extract the resource ID from the request
     * - Fetch the resource from the database
     * - Return the resource or appropriate error response
     * 
     * @param {Request} req - Express request object containing the resource ID
     * @param {Response} res - Express response object for sending the API response
     * @returns {Promise<void>} Resolves when the response has been sent
     */
    read(req: Request, res: Response): Promise<void>;

    /**
     * Updates an existing resource.
     * Controllers implementing this method should:
     * - Extract the resource ID and update data from the request
     * - Validate the update payload
     * - Update the resource in the database
     * - Return appropriate success/error response
     * 
     * @param {Request} req - Express request object containing the update data
     * @param {Response} res - Express response object for sending the API response
     * @returns {Promise<void>} Resolves when the response has been sent
     */
    update(req: Request, res: Response): Promise<void>;

    /**
     * Deletes a resource by its identifier.
     * Controllers implementing this method should:
     * - Extract the resource ID from the request
     * - Delete the resource from the database
     * - Return appropriate success/error response
     * 
     * @param {Request} req - Express request object containing the resource ID
     * @param {Response} res - Express response object for sending the API response
     * @returns {Promise<void>} Resolves when the response has been sent
     */
    delete(req: Request, res: Response): Promise<void>;
}