/**
 * Task Controller Implementation
 * 
 * Requirements Addressed:
 * - Task Management API Endpoints (Technical Specification/System Design/API Design/API Architecture)
 *   Implements the controller layer for managing Task entities, providing endpoints for CRUD operations
 *   and validation.
 * 
 * Human Tasks:
 * - Configure rate limiting for API endpoints
 * - Set up API monitoring and analytics
 * - Configure request timeout settings
 * - Review and adjust error handling strategies
 */

import { Request, Response } from 'express'; // express v4.18.2
import { TaskService } from '../services/task.service';
import { validateTask } from '../validators/task.validator';
import { handleError } from '../../shared/utils/error-handler';
import { formatSuccessResponse } from '../../shared/utils/response-formatter';
import { STATUS_CODES } from '../../shared/constants/status-codes';

/**
 * Controller class handling HTTP requests for Task entity operations
 */
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Creates a new Task entity
   * @param req Express request object containing task data
   * @param res Express response object
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      // Validate task data
      const validationError = validateTask(req.body);
      if (validationError) {
        handleError(validationError, res);
        return;
      }

      // Create task using service
      const createdTask = await this.taskService.createTask(req.body);

      // Send success response
      res.status(STATUS_CODES.CREATED).json(
        formatSuccessResponse(createdTask, STATUS_CODES.CREATED)
      );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Retrieves a Task entity by ID
   * @param req Express request object containing task ID
   * @param res Express response object
   */
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.id;
      const task = await this.taskService.getTaskById(taskId);

      if (!task) {
        handleError({
          code: 'RESOURCE_NOT_FOUND',
          message: `Task with ID ${taskId} not found`,
          details: { taskId }
        }, res);
        return;
      }

      res.status(STATUS_CODES.OK).json(
        formatSuccessResponse(task, STATUS_CODES.OK)
      );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Updates an existing Task entity
   * @param req Express request object containing task ID and update data
   * @param res Express response object
   */
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.id;
      const updateData = req.body;

      // Validate update data
      const validationError = validateTask(updateData);
      if (validationError) {
        handleError(validationError, res);
        return;
      }

      const updatedTask = await this.taskService.updateTask(taskId, updateData);

      if (!updatedTask) {
        handleError({
          code: 'RESOURCE_NOT_FOUND',
          message: `Task with ID ${taskId} not found`,
          details: { taskId }
        }, res);
        return;
      }

      res.status(STATUS_CODES.OK).json(
        formatSuccessResponse(updatedTask, STATUS_CODES.OK)
      );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Deletes a Task entity
   * @param req Express request object containing task ID
   * @param res Express response object
   */
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.id;
      const deleted = await this.taskService.deleteTask(taskId);

      if (!deleted) {
        handleError({
          code: 'RESOURCE_NOT_FOUND',
          message: `Task with ID ${taskId} not found`,
          details: { taskId }
        }, res);
        return;
      }

      res.status(STATUS_CODES.OK).json(
        formatSuccessResponse({ message: 'Task deleted successfully' }, STATUS_CODES.OK)
      );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Retrieves a paginated list of Task entities
   * @param req Express request object containing pagination parameters
   * @param res Express response object
   */
  async listTasks(req: Request, res: Response): Promise<void> {
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

      const tasks = await this.taskService.listTasks(page, pageSize);

      res.status(STATUS_CODES.OK).json(
        formatSuccessResponse(tasks, STATUS_CODES.OK)
      );
    } catch (error) {
      handleError(error, res);
    }
  }
}