/**
 * Task repository implementation for managing Task entities in the database
 * 
 * Requirements Addressed:
 * - Task Management Data Model (Technical Specification/System Design/Database Design/Schema Design)
 *   Implements repository methods for interacting with the Task data model, including CRUD operations
 *   and task-specific queries.
 * 
 * Human Tasks:
 * - Configure database connection pool settings in production
 * - Set up database monitoring and query performance tracking
 * - Implement database backup and recovery procedures
 * - Configure database replication for high availability
 */

import { BaseRepository, PaginatedResult } from '../../shared/interfaces/base-repository.interface';
import { Task } from '../models/task.model';
import { logger } from '../../shared/utils/logger';

/**
 * Repository class for handling Task entity database operations
 * Implements the BaseRepository interface for standardized CRUD operations
 */
export class TaskRepository implements BaseRepository<Task> {
  /**
   * Initializes a new instance of TaskRepository
   * @param dbConnection Database connection instance for executing queries
   */
  constructor(private readonly dbConnection: DatabaseConnection) {
    logger.logInfo('TaskRepository initialized');
  }

  /**
   * Creates a new Task entity in the database
   * @param task The Task entity to create
   * @returns Promise resolving to the created Task
   * @throws Error if task creation fails
   */
  async create(task: Task): Promise<Task> {
    try {
      logger.logDebug(`Creating task: ${task.title}`);

      // Begin transaction
      const transaction = await this.dbConnection.beginTransaction();

      try {
        // Insert task into database
        const result = await transaction.query(
          'INSERT INTO tasks (id, title, description, due_date, assignee_id, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [task.id, task.title, task.description, task.dueDate, task.assigneeId, task.status, task.priority]
        );

        // Commit transaction
        await transaction.commit();

        logger.logInfo(`Task created successfully: ${task.id}`);
        return task;
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.logError({
        code: 'TASK_CREATION_FAILED',
        message: 'Failed to create task',
        details: error
      });
      throw error;
    }
  }

  /**
   * Finds a Task entity by its ID
   * @param id The ID of the task to find
   * @returns Promise resolving to the Task if found, null otherwise
   */
  async findById(id: string): Promise<Task | null> {
    try {
      logger.logDebug(`Finding task by ID: ${id}`);

      const result = await this.dbConnection.query(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );

      if (!result || result.length === 0) {
        logger.logDebug(`No task found with ID: ${id}`);
        return null;
      }

      const taskData = result[0];
      return new Task(
        taskData.id,
        taskData.title,
        taskData.description,
        new Date(taskData.due_date),
        taskData.assignee_id,
        taskData.status,
        taskData.priority
      );
    } catch (error) {
      logger.logError({
        code: 'TASK_FETCH_FAILED',
        message: `Failed to fetch task with ID: ${id}`,
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
   * @throws Error if task update fails
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      logger.logDebug(`Updating task: ${id}`);

      // Begin transaction
      const transaction = await this.dbConnection.beginTransaction();

      try {
        // Build update query dynamically based on provided updates
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (updates.title !== undefined) {
          updateFields.push('title = ?');
          updateValues.push(updates.title);
        }
        if (updates.description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(updates.description);
        }
        if (updates.dueDate !== undefined) {
          updateFields.push('due_date = ?');
          updateValues.push(updates.dueDate);
        }
        if (updates.assigneeId !== undefined) {
          updateFields.push('assignee_id = ?');
          updateValues.push(updates.assigneeId);
        }
        if (updates.status !== undefined) {
          updateFields.push('status = ?');
          updateValues.push(updates.status);
        }
        if (updates.priority !== undefined) {
          updateFields.push('priority = ?');
          updateValues.push(updates.priority);
        }

        // Add ID to values array for WHERE clause
        updateValues.push(id);

        // Execute update query
        await transaction.query(
          `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );

        // Commit transaction
        await transaction.commit();

        // Fetch and return updated task
        const updatedTask = await this.findById(id);
        if (!updatedTask) {
          throw new Error(`Task not found after update: ${id}`);
        }

        logger.logInfo(`Task updated successfully: ${id}`);
        return updatedTask;
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.logError({
        code: 'TASK_UPDATE_FAILED',
        message: `Failed to update task with ID: ${id}`,
        details: error
      });
      throw error;
    }
  }

  /**
   * Deletes a Task entity by its ID
   * @param id The ID of the task to delete
   * @returns Promise resolving to true if deletion was successful, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      logger.logDebug(`Deleting task: ${id}`);

      // Begin transaction
      const transaction = await this.dbConnection.beginTransaction();

      try {
        // Delete task
        const result = await transaction.query(
          'DELETE FROM tasks WHERE id = ?',
          [id]
        );

        // Commit transaction
        await transaction.commit();

        const deleted = result.affectedRows > 0;
        if (deleted) {
          logger.logInfo(`Task deleted successfully: ${id}`);
        } else {
          logger.logDebug(`No task found to delete with ID: ${id}`);
        }

        return deleted;
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.logError({
        code: 'TASK_DELETION_FAILED',
        message: `Failed to delete task with ID: ${id}`,
        details: error
      });
      throw error;
    }
  }

  /**
   * Finds all Task entities with pagination
   * @param page The page number (1-based)
   * @param pageSize The number of items per page
   * @returns Promise resolving to a PaginatedResult containing the tasks
   */
  async findAll(page: number, pageSize: number): Promise<PaginatedResult<Task>> {
    try {
      logger.logDebug(`Finding all tasks - page: ${page}, pageSize: ${pageSize}`);

      // Calculate offset
      const offset = (page - 1) * pageSize;

      // Get total count
      const countResult = await this.dbConnection.query(
        'SELECT COUNT(*) as total FROM tasks'
      );
      const total = countResult[0].total;

      // Get paginated tasks
      const tasksResult = await this.dbConnection.query(
        'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [pageSize, offset]
      );

      // Convert results to Task instances
      const tasks = tasksResult.map((taskData: any) => new Task(
        taskData.id,
        taskData.title,
        taskData.description,
        new Date(taskData.due_date),
        taskData.assignee_id,
        taskData.status,
        taskData.priority
      ));

      logger.logDebug(`Found ${tasks.length} tasks for page ${page}`);

      return {
        items: tasks,
        total,
        page,
        pageSize
      };
    } catch (error) {
      logger.logError({
        code: 'TASK_FETCH_ALL_FAILED',
        message: 'Failed to fetch tasks',
        details: error
      });
      throw error;
    }
  }
}