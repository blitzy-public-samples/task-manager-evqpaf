/**
 * @fileoverview User Controller Implementation
 * 
 * Requirements Addressed:
 * - User Management (Technical Specification/System Design/Database Design/Schema Design)
 *   Provides an interface for managing User entities through HTTP endpoints.
 * 
 * Human Tasks:
 * - Configure rate limiting for user endpoints
 * - Set up monitoring for user operations
 * - Review and configure user-related security policies
 */

// Third-party imports
import { Request, Response } from 'express'; // @types/express ^4.17.x

// Internal imports
import { BaseController } from '../../../shared/interfaces/base-controller.interface';
import { UserService } from '../services/user.service';
import { validateUser } from '../validators/user.validator';
import { formatSuccessResponse } from '../../../shared/utils/response-formatter';
import { handleError } from '../../../shared/utils/error-handler';

/**
 * Controller class handling HTTP requests for User entity management.
 * Implements BaseController interface to ensure standardized CRUD operations.
 */
export class UserController implements BaseController {
    /**
     * Creates a new instance of UserController
     * @param userService - Service instance for handling user business logic
     */
    constructor(private readonly userService: UserService) {}

    /**
     * Handles the creation of a new User entity.
     * 
     * @param req - Express request object containing user data
     * @param res - Express response object
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            // Extract user data from request body
            const userData = req.body;

            // Validate user data
            const validationError = validateUser(userData);
            if (validationError) {
                handleError(validationError, res);
                return;
            }

            // Create user through service
            const createdUser = await this.userService.create(userData);

            // Send successful response
            res.status(201).json(formatSuccessResponse(createdUser, 201));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Retrieves a User entity by its ID.
     * 
     * @param req - Express request object containing user ID
     * @param res - Express response object
     */
    async read(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;

            // Retrieve user through service
            const user = await this.userService.findById(userId);

            if (!user) {
                handleError({
                    code: 'RESOURCE_NOT_FOUND',
                    message: `User not found with ID: ${userId}`,
                    details: { userId }
                }, res);
                return;
            }

            // Send successful response
            res.json(formatSuccessResponse(user));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Updates an existing User entity.
     * 
     * @param req - Express request object containing user ID and update data
     * @param res - Express response object
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const updateData = req.body;

            // Validate update data
            const validationError = validateUser({ ...updateData, id: userId });
            if (validationError) {
                handleError(validationError, res);
                return;
            }

            // Update user through service
            const updatedUser = await this.userService.update(userId, updateData);

            if (!updatedUser) {
                handleError({
                    code: 'RESOURCE_NOT_FOUND',
                    message: `User not found with ID: ${userId}`,
                    details: { userId }
                }, res);
                return;
            }

            // Send successful response
            res.json(formatSuccessResponse(updatedUser));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Deletes a User entity by its ID.
     * 
     * @param req - Express request object containing user ID
     * @param res - Express response object
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;

            // Delete user through service
            const deleted = await this.userService.delete(userId);

            if (!deleted) {
                handleError({
                    code: 'RESOURCE_NOT_FOUND',
                    message: `User not found with ID: ${userId}`,
                    details: { userId }
                }, res);
                return;
            }

            // Send successful response
            res.json(formatSuccessResponse({ message: 'User deleted successfully' }));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Retrieves a paginated list of User entities.
     * 
     * @param req - Express request object containing pagination parameters
     * @param res - Express response object
     */
    async listUsers(req: Request, res: Response): Promise<void> {
        try {
            // Extract and validate pagination parameters
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;

            if (page < 1 || pageSize < 1) {
                handleError({
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid pagination parameters',
                    details: { page, pageSize }
                }, res);
                return;
            }

            // Retrieve users through service
            const users = await this.userService.findAll(page, pageSize);

            // Send successful response
            res.json(formatSuccessResponse(users));
        } catch (error) {
            handleError(error, res);
        }
    }
}