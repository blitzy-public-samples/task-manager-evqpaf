/**
 * API Configuration Module
 * 
 * Requirements Addressed:
 * - API Configuration (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides centralized configurations for API interactions, ensuring consistency 
 *   and maintainability.
 * 
 * Human Tasks:
 * - Verify API_TIMEOUT value meets performance requirements
 * - Ensure BASE_API_URL is correctly configured for the deployment environment
 * - Configure appropriate CORS and security headers in production
 */

// Import relative to current file location
import { BASE_API_URL } from '../constants/api.constants';
import { makeApiRequest } from '../utils/api.utils';
import { CommonStatus } from '../types/common.types';

/**
 * Global API timeout value in milliseconds
 * Defines the maximum time to wait for API responses
 */
const API_TIMEOUT = 5000;

/**
 * Interface defining the structure of API configuration settings
 */
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: {
    'Content-Type': string;
    'Accept': string;
  };
  statusValues: {
    active: CommonStatus.ACTIVE;
    inactive: CommonStatus.INACTIVE;
  };
}

/**
 * Retrieves the API configuration settings.
 * Centralizes API-related configuration to ensure consistency across the application.
 * 
 * @returns {ApiConfig} An object containing API configuration settings
 */
export function getApiConfig(): ApiConfig {
  return {
    baseUrl: BASE_API_URL,
    timeout: API_TIMEOUT,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    statusValues: {
      active: CommonStatus.ACTIVE,
      inactive: CommonStatus.INACTIVE
    }
  };
}