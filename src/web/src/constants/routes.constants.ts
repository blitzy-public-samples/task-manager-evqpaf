/**
 * Route Constants
 * 
 * Requirements Addressed:
 * - Route Management (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Provides centralized route constants to ensure consistent navigation and routing across the application.
 * 
 * Human Tasks:
 * - Verify that all route paths align with the configured web server routing rules
 * - Ensure route paths match any URL patterns expected by authentication middleware
 * - Confirm that the NOT_FOUND route is properly handled by the error boundary component
 */

import { CommonStatus } from '../types/common.types';
import { BASE_API_URL } from './api.constants';

/**
 * Application route constants
 * Centralized definition of all route paths used in the application
 * to ensure consistency and easier maintenance.
 */
export const ROUTES = {
  /**
   * Authentication route
   * Path for the login page where users authenticate
   * Related API endpoint: ${BASE_API_URL}/auth/login
   */
  LOGIN: '/login',

  /**
   * Dashboard route
   * Main landing page after successful authentication
   * Displays user-specific overview and metrics
   */
  DASHBOARD: '/dashboard',

  /**
   * Projects route
   * Lists all projects and provides project management functionality
   * Related API endpoint: ${BASE_API_URL}/projects
   */
  PROJECTS: '/projects',

  /**
   * Tasks route
   * Displays task list and task management interface
   * Related API endpoint: ${BASE_API_URL}/tasks
   */
  TASKS: '/tasks',

  /**
   * Profile route
   * User profile management and settings
   * Related API endpoint: ${BASE_API_URL}/users/profile
   */
  PROFILE: '/profile',

  /**
   * Not Found route
   * Displayed when accessing undefined routes
   * Should be handled by the application's error boundary
   */
  NOT_FOUND: '/404'
} as const;

/**
 * Type definition for route paths
 * Ensures type safety when using route constants
 */
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

/**
 * Type guard to check if a given path is a valid route
 * @param path - The path to check
 * @returns boolean indicating if the path is a valid route
 */
export function isValidRoute(path: string): path is RoutePath {
  return Object.values(ROUTES).includes(path as RoutePath);
}