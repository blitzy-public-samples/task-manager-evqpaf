/**
 * Authentication Configuration Module
 * 
 * Requirements Addressed:
 * - Authentication Configuration (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides centralized configurations for authentication, ensuring consistency and maintainability
 *   across the frontend.
 * 
 * Human Tasks:
 * - Verify token storage mechanism meets security requirements
 * - Ensure authentication endpoints match backend API configuration
 * - Configure appropriate token refresh intervals
 * - Verify CORS settings for authentication endpoints
 */

// axios v1.4.0
import axios from 'axios';
import { BASE_API_URL } from '../constants/api.constants';
import { AuthInterface } from '../interfaces/auth.interface';
import { makeApiRequest } from '../utils/api.utils';
import { getApiConfig } from './api.config';

// Authentication API endpoint
const AUTH_API_ENDPOINT = `${BASE_API_URL}/auth`;

// Token storage keys
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'task_management_access_token',
  REFRESH_TOKEN: 'task_management_refresh_token',
  TOKEN_EXPIRY: 'task_management_token_expiry'
} as const;

// Authentication configuration settings
interface AuthConfig {
  apiEndpoint: string;
  tokenStorage: typeof TOKEN_STORAGE_KEYS;
  tokenRefreshInterval: number; // in milliseconds
  loginEndpoint: string;
  logoutEndpoint: string;
  refreshEndpoint: string;
  validateEndpoint: string;
}

/**
 * Retrieves the authentication configuration settings.
 * Provides centralized access to authentication-related configuration.
 * 
 * @returns {AuthConfig} Object containing authentication configuration settings
 */
export function getAuthConfig(): AuthConfig {
  const apiConfig = getApiConfig();

  return {
    apiEndpoint: AUTH_API_ENDPOINT,
    tokenStorage: TOKEN_STORAGE_KEYS,
    tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
    loginEndpoint: `${AUTH_API_ENDPOINT}/login`,
    logoutEndpoint: `${AUTH_API_ENDPOINT}/logout`,
    refreshEndpoint: `${AUTH_API_ENDPOINT}/refresh`,
    validateEndpoint: `${AUTH_API_ENDPOINT}/validate`
  };
}

/**
 * Authenticates a user by sending their credentials to the authentication API.
 * 
 * @param {AuthInterface} credentials - User credentials containing email and password
 * @returns {Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>}
 * @throws {Error} If authentication fails
 */
export async function authenticateUser(
  credentials: AuthInterface
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const config = getAuthConfig();

  try {
    const response = await makeApiRequest(config.loginEndpoint, {
      method: 'POST',
      data: credentials,
      validateAuth: true
    });

    // Store tokens securely
    localStorage.setItem(config.tokenStorage.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(config.tokenStorage.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(
      config.tokenStorage.TOKEN_EXPIRY,
      (Date.now() + response.expiresIn * 1000).toString()
    );

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn
    };
  } catch (error) {
    // Clear any existing tokens on authentication failure
    localStorage.removeItem(config.tokenStorage.ACCESS_TOKEN);
    localStorage.removeItem(config.tokenStorage.REFRESH_TOKEN);
    localStorage.removeItem(config.tokenStorage.TOKEN_EXPIRY);

    throw error;
  }
}