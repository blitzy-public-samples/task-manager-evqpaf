/**
 * Authentication Interfaces
 * 
 * Requirements Addressed:
 * - Authentication Data Structures (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides interfaces for authentication-related data structures to ensure consistent 
 *   and type-safe handling of authentication data.
 * 
 * Human Tasks:
 * - Ensure email validation patterns match the backend requirements
 * - Verify password complexity requirements align with security policies
 */

import { BASE_API_URL } from '../constants/api.constants';

/**
 * Interface defining the structure for authentication data.
 * Used for login and registration requests to the API endpoint: ${BASE_API_URL}/auth
 */
export interface AuthInterface {
  /**
   * User's email address used for authentication
   * Must be a valid email format
   */
  email: string;

  /**
   * User's password for authentication
   * Should meet security requirements (length, complexity, etc.)
   */
  password: string;
}

/**
 * Interface defining the structure for authentication credentials.
 * Used internally for consistent typing of authentication data.
 */
interface AuthCredentials {
  /**
   * User's email address
   * Must be a valid email format
   */
  email: string;

  /**
   * User's password
   * Should meet security requirements (length, complexity, etc.)
   */
  password: string;
}