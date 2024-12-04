/**
 * Common Types and Enums
 * 
 * Requirements Addressed:
 * - Type Safety and Consistency (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides common types and enums to ensure consistent and type-safe handling of data 
 *   structures across the application.
 * 
 * Human Tasks:
 * - Ensure CommonStatus values align with backend status definitions
 * - Verify CommonPriority levels match project requirements and backend validation
 */

import { ThemeType } from './theme.types';
import { AuthInterface } from '../interfaces/auth.interface';
import { ProjectInterface } from '../interfaces/project.interface';
import { TaskInterface } from '../interfaces/task.interface';
import { UserInterface } from '../interfaces/user.interface';

/**
 * Enum representing common status values used across different entities
 * in the application (e.g., projects, tasks, user accounts).
 * 
 * This provides a standardized way to represent status across the application
 * to ensure consistency in status handling and display.
 */
export enum CommonStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

/**
 * Enum representing common priority levels used across different entities
 * in the application (e.g., tasks, projects).
 * 
 * This provides a standardized way to represent priority levels across
 * the application to ensure consistency in priority handling and display.
 */
export enum CommonPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Type alias for entities that can have a status.
 * Ensures consistent typing for status-enabled entities.
 */
export type StatusEnabled = {
  status: CommonStatus;
};

/**
 * Type alias for entities that can have a priority.
 * Ensures consistent typing for priority-enabled entities.
 */
export type PriorityEnabled = {
  priority: CommonPriority;
};

/**
 * Type alias for basic entity properties that are commonly used
 * across different interfaces in the application.
 */
export type BaseEntity = {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Type guard to check if an entity has a status
 * @param entity - The entity to check
 * @returns boolean indicating if the entity has a valid status
 */
export function hasStatus(entity: any): entity is StatusEnabled {
  return entity && 
         Object.values(CommonStatus).includes(entity.status as CommonStatus);
}

/**
 * Type guard to check if an entity has a priority
 * @param entity - The entity to check
 * @returns boolean indicating if the entity has a valid priority
 */
export function hasPriority(entity: any): entity is PriorityEnabled {
  return entity && 
         Object.values(CommonPriority).includes(entity.priority as CommonPriority);
}