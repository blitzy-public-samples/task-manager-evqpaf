/**
 * Authentication Service
 * 
 * Requirements Addressed:
 * - Authentication Services (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Implements authentication services such as login, logout, and token management
 *   to ensure secure user access.
 * 
 * Human Tasks:
 * - Verify token storage mechanism meets security requirements
 * - Configure appropriate token refresh intervals
 * - Ensure proper token cleanup on logout
 * - Review error handling and retry strategies for token operations
 */

// axios v1.4.0
import axios from 'axios';
import { AuthInterface } from '../interfaces/auth.interface';
import { AUTH_API_ENDPOINT } from '../config/auth.config';
import { makeApiRequest } from '../utils/api.utils';

// Token storage keys
const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Authenticates a user by sending their credentials to the authentication API.
 * 
 * @param credentials - User credentials containing email and password
 * @returns Promise resolving to the authentication response with tokens
 * @throws ApiRequestError if authentication fails
 */
export async function login(credentials: AuthInterface): Promise<object> {
  try {
    const response = await makeApiRequest(`${AUTH_API_ENDPOINT}/login`, {
      method: 'POST',
      data: credentials,
      validateAuth: true
    });

    // Store tokens securely
    if (response.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    }
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }

    return response;
  } catch (error) {
    // Clear any existing tokens on login failure
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    throw error;
  }
}

/**
 * Logs out the user by clearing their authentication tokens and notifying the server.
 * 
 * @returns void
 */
export function logout(): void {
  try {
    // Attempt to notify server about logout
    const token = getToken();
    if (token) {
      makeApiRequest(`${AUTH_API_ENDPOINT}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => {
        // Silently handle server notification failures
        // Still proceed with local cleanup
      });
    }
  } finally {
    // Always clear local tokens regardless of server response
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

/**
 * Retrieves the stored authentication token.
 * 
 * @returns The stored authentication token or null if not found
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Checks if the user is currently authenticated.
 * 
 * @returns boolean indicating if a valid token exists
 */
function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null && token !== undefined;
}

/**
 * Retrieves the stored refresh token.
 * 
 * @returns The stored refresh token or null if not found
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Validates the current authentication token with the server.
 * 
 * @returns Promise<boolean> indicating if the token is valid
 */
async function validateToken(): Promise<boolean> {
  try {
    const token = getToken();
    if (!token) {
      return false;
    }

    await makeApiRequest(`${AUTH_API_ENDPOINT}/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return true;
  } catch {
    return false;
  }
}