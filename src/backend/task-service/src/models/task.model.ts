/**
 * Task model implementation for the task service
 * 
 * Requirements Addressed:
 * - Task Management Data Model (Technical Specification/System Design/Database Design/Schema Design)
 *   Implements the core Task entity with properties like title, description, due date, status, and priority
 */

import { BaseRepository } from '../../shared/interfaces/base-repository.interface';
import { PaginatedResult } from '../../shared/types/common.types';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { logger } from '../../shared/utils/logger';

/**
 * Enum representing the possible states of a task
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

/**
 * Represents a task entity in the system with all its properties and behaviors
 */
export class Task {
  /**
   * Creates a new Task instance
   * 
   * @param id - Unique identifier for the task
   * @param title - Title/name of the task
   * @param description - Detailed description of the task
   * @param dueDate - Due date for task completion
   * @param assigneeId - ID of the user assigned to the task
   * @param status - Current status of the task
   * @param priority - Priority level of the task (1-5, where 5 is highest)
   */
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public dueDate: Date,
    public assigneeId: string,
    public status: TaskStatus,
    public priority: number
  ) {
    // Validate priority range
    if (priority < 1 || priority > 5) {
      throw new Error('Priority must be between 1 and 5');
    }

    // Validate title length
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }

    // Validate due date
    if (dueDate && dueDate < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    // Log task creation
    logger.logInfo(`Task created: ${id} - ${title}`);
  }

  /**
   * Updates the status of the task and logs the change
   * 
   * @param newStatus - The new status to set for the task
   * @throws Error if the status transition is invalid
   */
  public updateStatus(newStatus: TaskStatus): void {
    // Validate status transition
    if (this.status === TaskStatus.ARCHIVED && newStatus !== TaskStatus.ARCHIVED) {
      throw new Error('Cannot change status of archived task');
    }

    // Store old status for logging
    const oldStatus = this.status;
    
    // Update status
    this.status = newStatus;

    // Log status change
    logger.logInfo(
      `Task ${this.id} status updated from ${oldStatus} to ${newStatus}`
    );
  }

  /**
   * Converts the task instance to a plain JSON object
   * Used for API responses and data transfer
   * 
   * @returns A JSON representation of the task
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate.toISOString(),
      assigneeId: this.assigneeId,
      status: this.status,
      priority: this.priority
    };
  }
}