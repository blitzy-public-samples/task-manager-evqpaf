/**
 * @fileoverview Notification model for the notification service
 * 
 * Requirement Addressed: Notification Data Model
 * Location: Technical Specification/System Design/Database Design/Schema Design
 * Description: Implements the data model for notifications with fields for message content,
 * recipient, and status.
 */

import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { ErrorResponse } from '../../shared/types/common.types';

/**
 * Enum representing the possible states of a notification
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

/**
 * Represents a notification entity in the system
 */
export class Notification {
  /**
   * Unique identifier for the notification
   */
  public id: string;

  /**
   * ID of the user who should receive this notification
   */
  public recipientId: string;

  /**
   * Content of the notification message
   */
  public message: string;

  /**
   * Current status of the notification
   */
  public status: string;

  /**
   * Timestamp when the notification was created
   */
  public createdAt: Date;

  /**
   * Timestamp when the notification was last updated
   */
  public updatedAt: Date;

  /**
   * Creates a new instance of the Notification class
   * 
   * @param id - Unique identifier for the notification
   * @param recipientId - ID of the recipient user
   * @param message - Content of the notification message
   * @param status - Current status of the notification
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   */
  constructor(
    id: string,
    recipientId: string,
    message: string,
    status: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.recipientId = recipientId;
    this.message = message;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validates the notification instance
   * 
   * @returns ErrorResponse if validation fails, null if validation passes
   */
  public validate(): ErrorResponse | null {
    // Check for required fields
    if (!this.id || !this.recipientId || !this.message || !this.status) {
      return {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'All fields are required: id, recipientId, message, status',
        details: {
          statusCode: STATUS_CODES.BAD_REQUEST,
          fields: {
            id: !this.id ? 'Required' : undefined,
            recipientId: !this.recipientId ? 'Required' : undefined,
            message: !this.message ? 'Required' : undefined,
            status: !this.status ? 'Required' : undefined
          }
        }
      };
    }

    // Validate status value
    const validStatuses = Object.values(NotificationStatus);
    if (!validStatuses.includes(this.status as NotificationStatus)) {
      return {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        details: {
          statusCode: STATUS_CODES.BAD_REQUEST,
          field: 'status',
          value: this.status,
          allowedValues: validStatuses
        }
      };
    }

    // Validate timestamps
    if (!(this.createdAt instanceof Date) || !(this.updatedAt instanceof Date)) {
      return {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid timestamp format for createdAt or updatedAt',
        details: {
          statusCode: STATUS_CODES.BAD_REQUEST,
          fields: {
            createdAt: !(this.createdAt instanceof Date) ? 'Invalid date format' : undefined,
            updatedAt: !(this.updatedAt instanceof Date) ? 'Invalid date format' : undefined
          }
        }
      };
    }

    // Validate message length
    if (this.message.length === 0 || this.message.length > 1000) {
      return {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Message length must be between 1 and 1000 characters',
        details: {
          statusCode: STATUS_CODES.BAD_REQUEST,
          field: 'message',
          length: this.message.length,
          allowedRange: { min: 1, max: 1000 }
        }
      };
    }

    // All validations passed
    return null;
  }
}