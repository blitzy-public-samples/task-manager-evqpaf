/**
 * Task service implementation for managing Task entities
 * 
 * Requirements Addressed:
 * - Task Management Business Logic (Technical Specification/System Design/Component Details/Core Components)
 *   Implements the business logic for managing tasks, including CRUD operations, status updates, and validation.
 * 
 * Human Tasks:
 * - Configure task archival policy and cleanup jobs
 * - Set up monitoring for task completion rates
 * - Configure notification thresholds for overdue tasks
 * - Review and adjust task validation rules based on business needs
 */

import { BaseService } from '../../shared/interfaces/base-service.interface';
import { TaskRepository } from '../repositories/task.repository';
import { Task, TaskStatus } from '../models/task.model';
import { handleError } from '../../shared/utils/error-handler';
import { logger } from '../../shared/utils/logger';
import { PaginatedResult } from '../../shared/types/common.types';
import { ERROR_CODES } from '../../shared/constants/error-codes';

/**
 * Service class implementing business logic for Task entity management
 * Implements the BaseService interface for standardized CRUD operations
 */
export class TaskService implements BaseService<Task> {
  /**
   * Initializes a new instance of TaskService
   * @param taskRepository Repository for Task entity persistence
   */
  constructor(private readonly taskRepository: TaskRepository) {
    logger.logInfo('TaskService initialized');
  }

  /**
   * Creates a new Task entity
   * @param task The Task entity to create
   * @returns Promise resolving to the created Task
   * @throws ValidationError if task data is invalid
   * @throws DatabaseError if creation fails
   */
  async create(task: Task): Promise<Task> {
    try {
      logger.logDebug(`Creating task: ${task.title}`);

      // Validate task data
      this.validateTask(task);

      // Create task in repository
      const createdTask = await this.taskRepository.create(task);

      logger.logInfo(`Task created successfully: ${createdTask.id}`);
      return createdTask;
    } catch (error) {
      logger.logError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Failed to create task',
        details: error
      });
      throw error;
    }
  }

  /**
   * Retrieves a Task entity by its ID
   * @param id The ID of the task to retrieve
   * @returns Promise resolving to the Task if found, null otherwise
   * @throws DatabaseError if retrieval fails
   */
  async findById(id: string): Promise<Task | null> {
    try {
      logger.logDebug(`Finding task by ID: ${id}`);

      const task = await this.taskRepository.findById(id);

      if (task) {
        logger.logDebug(`Found task: ${id}`);
      } else {
        logger.logDebug(`No task found with ID: ${id}`);
      }

      return task;
    } catch (error) {
      logger.logError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: `Failed to find task with ID: ${id}`,
        details: error
      });
      throw error;
    }
  }

  /**
   * Updates an existing Task entity
   * @param id The ID of the task to update
   * @param updates Partial Task object containing the fields to update
   * @returns Promise resolving to the updated Task
   * @throws NotFoundError if task doesn't exist
   * @throws ValidationError if updates are invalid
   * @throws DatabaseError if update fails
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      logger.logDebug(`Updating task: ${id}`);

      // Check if task exists
      const existingTask = await this.taskRepository.findById(id);
      if (!existingTask) {
        throw new Error(`Task not found: ${id}`);
      }

      // Validate updates
      this.validateUpdates(updates);

      // If status is being updated, use the Task model's updateStatus method
      if (updates.status && updates.status !== existingTask.status) {
        existingTask.updateStatus(updates.status);
      }

      // Update task in repository
      const updatedTask = await this.taskRepository.update(id, updates);

      logger.logInfo(`Task updated successfully: ${id}`);
      return updatedTask;
    } catch (error) {
      logger.logError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Failed to update task with ID: ${id}`,
        details: error
      });
      throw error;
    }
  }

  /**
   * Deletes a Task entity
   * @param id The ID of the task to delete
   * @returns Promise resolving to true if deletion was successful
   * @throws NotFoundError if task doesn't exist
   * @throws DatabaseError if deletion fails
   */
  async delete(id: string): Promise<boolean> {
    try {
      logger.logDebug(`Deleting task: ${id}`);

      // Check if task exists
      const existingTask = await this.taskRepository.findById(id);
      if (!existingTask) {
        throw new Error(`Task not found: ${id}`);
      }

      // Delete task from repository
      const deleted = await this.taskRepository.delete(id);

      if (deleted) {
        logger.logInfo(`Task deleted successfully: ${id}`);
      } else {
        logger.logDebug(`Failed to delete task: ${id}`);
      }

      return deleted;
    } catch (error) {
      logger.logError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: `Failed to delete task with ID: ${id}`,
        details: error
      });
      throw error;
    }
  }

  /**
   * Retrieves all Task entities with pagination
   * @param page The page number (1-based)
   * @param pageSize The number of items per page
   * @returns Promise resolving to a paginated result containing the tasks
   * @throws ValidationError if pagination parameters are invalid
   * @throws DatabaseError if retrieval fails
   */
  async findAll(page: number, pageSize: number): Promise<PaginatedResult<Task>> {
    try {
      logger.logDebug(`Finding all tasks - page: ${page}, pageSize: ${pageSize}`);

      // Validate pagination parameters
      if (page < 1) throw new Error('Page must be greater than 0');
      if (pageSize < 1) throw new Error('Page size must be greater than 0');

      // Get paginated tasks from repository
      const result = await this.taskRepository.findAll(page, pageSize);

      logger.logDebug(`Found ${result.items.length} tasks for page ${page}`);
      return result;
    } catch (error) {
      logger.logError({
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve tasks',
        details: error
      });
      throw error;
    }
  }

  /**
   * Validates a Task entity's data
   * @param task The Task entity to validate
   * @throws ValidationError if task data is invalid
   */
  private validateTask(task: Task): void {
    if (!task.title || task.title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    if (task.dueDate && task.dueDate < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    if (task.priority < 1 || task.priority > 5) {
      throw new Error('Priority must be between 1 and 5');
    }

    if (!Object.values(TaskStatus).includes(task.status)) {
      throw new Error('Invalid task status');
    }
  }

  /**
   * Validates updates to a Task entity
   * @param updates Partial Task object containing the fields to update
   * @throws ValidationError if updates are invalid
   */
  private validateUpdates(updates: Partial<Task>): void {
    if (updates.title !== undefined && updates.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }

    if (updates.dueDate && updates.dueDate < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    if (updates.priority !== undefined && (updates.priority < 1 || updates.priority > 5)) {
      throw new Error('Priority must be between 1 and 5');
    }

    if (updates.status !== undefined && !Object.values(TaskStatus).includes(updates.status)) {
      throw new Error('Invalid task status');
    }
  }
}