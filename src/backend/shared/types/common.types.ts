/**
 * @fileoverview Defines shared types used across backend services
 * 
 * Requirements Addressed:
 * - Shared Type Definitions (Technical Specification/System Design/Data Management Strategy)
 *   Provides reusable type definitions to ensure consistency and maintainability across backend services.
 */

import { PaginatedResult } from '../interfaces/base-repository.interface';

/**
 * Represents a standardized error response structure used across the application
 * for consistent error handling and client communication.
 */
export type ErrorResponse = {
  /** 
   * The error code representing the type of error.
   * This should be a standardized string that can be used for error handling and internationalization.
   */
  code: string;

  /**
   * A human-readable message describing the error.
   * This message should be clear and concise, suitable for both logging and user display.
   */
  message: string;

  /**
   * Additional details about the error, if available.
   * This can include stack traces, validation errors, or any other relevant error context.
   */
  details: any;
};

/**
 * Re-export PaginatedResult type from base-repository interface
 * for convenient access across the application.
 * This type is used for standardizing paginated responses from repositories and services.
 */
export type { PaginatedResult };