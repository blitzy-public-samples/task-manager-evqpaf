/**
 * Task Routes Implementation
 * 
 * Requirements Addressed:
 * - Task Management API Endpoints (Technical Specification/System Design/API Design/API Architecture)
 *   Implements the routing layer for managing Task entities, providing endpoints for CRUD operations
 *   and validation.
 * 
 * Human Tasks:
 * - Configure rate limiting for API endpoints
 * - Set up API monitoring and analytics
 * - Configure request timeout settings
 * - Review and adjust error handling strategies
 */

import { Router } from 'express'; // express v4.18.2
import { TaskController } from '../controllers/task.controller';
import { validateTask } from '../validators/task.validator';
import { handleError } from '../../shared/utils/error-handler';
import { formatSuccessResponse } from '../../shared/utils/response-formatter';

// Initialize router
const taskRoutes = Router();

// Initialize controller
const taskController = new TaskController();

/**
 * POST /tasks
 * Creates a new task
 */
taskRoutes.post('/', async (req, res) => {
    try {
        // Validate request body
        const validationError = validateTask(req.body);
        if (validationError) {
            handleError(validationError, res);
            return;
        }

        await taskController.createTask(req, res);
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * GET /tasks/:id
 * Retrieves a specific task by ID
 */
taskRoutes.get('/:id', async (req, res) => {
    try {
        await taskController.getTaskById(req, res);
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * PUT /tasks/:id
 * Updates an existing task
 */
taskRoutes.put('/:id', async (req, res) => {
    try {
        // Validate request body
        const validationError = validateTask(req.body);
        if (validationError) {
            handleError(validationError, res);
            return;
        }

        await taskController.updateTask(req, res);
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * DELETE /tasks/:id
 * Deletes a specific task
 */
taskRoutes.delete('/:id', async (req, res) => {
    try {
        await taskController.deleteTask(req, res);
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * GET /tasks
 * Retrieves a paginated list of tasks
 */
taskRoutes.get('/', async (req, res) => {
    try {
        await taskController.listTasks(req, res);
    } catch (error) {
        handleError(error, res);
    }
});

// Export the router for use in the main application
export { taskRoutes };