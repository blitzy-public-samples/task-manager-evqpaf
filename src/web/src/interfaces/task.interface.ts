/**
 * Task Interface Definition
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Provides interfaces for task creation, assignment, priority and status tracking,
 *   due date management, and file attachments.
 * 
 * Human Tasks:
 * - Ensure task status values are synchronized with backend validation
 * - Verify priority levels match the project requirements
 * - Confirm date handling and timezone considerations for due dates
 */

import { ProjectInterface } from './project.interface';
import { UserInterface as User } from './user.interface';

/**
 * Enum for task status values to ensure consistent status usage
 * throughout the application
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

/**
 * Enum for task priority levels to maintain consistent
 * priority assignment across the application
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

/**
 * Interface representing a task entity in the application.
 * Defines the core structure for task data management and tracking.
 * 
 * @interface TaskInterface
 * @property {string} id - Unique identifier for the task
 * @property {string} title - Title/name of the task
 * @property {string} description - Detailed description of the task
 * @property {Date} dueDate - Deadline for task completion
 * @property {TaskStatus} status - Current status of the task
 * @property {TaskPriority} priority - Priority level of the task
 * @property {ProjectInterface} project - Associated project reference
 * @property {User} assignee - User assigned to the task
 */
export interface TaskInterface {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  project: Pick<ProjectInterface, 'id' | 'name'>;
  assignee: Pick<User, 'id' | 'email'>;
}

/**
 * Type definitions for task-related data structures
 * Localized to avoid circular dependencies
 */
export type LocalizedCommonTypes = {
  TaskStatus: keyof typeof TaskStatus;
  TaskPriority: keyof typeof TaskPriority;
}