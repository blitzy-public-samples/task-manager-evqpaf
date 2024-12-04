/**
 * @fileoverview User Routes Implementation
 * 
 * Requirements Addressed:
 * - User Management (Technical Specification/System Design/API Design/Interface Specifications)
 *   Provides API routes for managing User entities, including CRUD operations and user listing.
 * 
 * Human Tasks:
 * - Configure rate limiting for user endpoints
 * - Set up monitoring for API endpoints
 * - Review and configure endpoint-specific security policies
 * - Verify API documentation is up-to-date
 */

// Third-party imports
import { Router } from 'express'; // express v4.18.2

// Internal imports
import { UserController } from '../controllers/user.controller';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/utils/error-handler';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import { ERROR_CODES } from '../../../shared/constants/error-codes';

/**
 * Express router instance for handling user-related endpoints
 */
const userRoutes = Router();

// Initialize UserController instance
const userController = new UserController();

/**
 * POST /users
 * Creates a new user
 */
userRoutes.post('/', async (req, res) => {
    try {
        logger.logInfo('Received request to create new user');
        await userController.create(req, res);
    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to process user creation request',
            details: error
        });
        handleError(error, res);
    }
});

/**
 * GET /users/:id
 * Retrieves a specific user by ID
 */
userRoutes.get('/:id', async (req, res) => {
    try {
        logger.logInfo(`Received request to fetch user with ID: ${req.params.id}`);
        await userController.read(req, res);
    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to process user retrieval request',
            details: error
        });
        handleError(error, res);
    }
});

/**
 * PUT /users/:id
 * Updates an existing user
 */
userRoutes.put('/:id', async (req, res) => {
    try {
        logger.logInfo(`Received request to update user with ID: ${req.params.id}`);
        await userController.update(req, res);
    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to process user update request',
            details: error
        });
        handleError(error, res);
    }
});

/**
 * DELETE /users/:id
 * Deletes a specific user
 */
userRoutes.delete('/:id', async (req, res) => {
    try {
        logger.logInfo(`Received request to delete user with ID: ${req.params.id}`);
        await userController.delete(req, res);
    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to process user deletion request',
            details: error
        });
        handleError(error, res);
    }
});

/**
 * GET /users
 * Retrieves a paginated list of users
 */
userRoutes.get('/', async (req, res) => {
    try {
        logger.logInfo('Received request to list users');
        await userController.listUsers(req, res);
    } catch (error) {
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to process user listing request',
            details: error
        });
        handleError(error, res);
    }
});

// Export the router for use in the main application
export { userRoutes };