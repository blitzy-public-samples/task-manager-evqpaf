/**
 * Authentication Hook
 * 
 * Requirements Addressed:
 * - Authentication State Management (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides a custom hook for managing user authentication state, including login, logout, 
 *   and session handling.
 * 
 * Human Tasks:
 * - Verify token storage security requirements
 * - Configure token refresh intervals in production
 * - Ensure proper cleanup of auth tokens on logout
 */

// react-redux v8.0.5
import { useDispatch, useSelector } from 'react-redux';
import { AuthCredentials } from '../interfaces/auth.interface';
import { login } from '../services/auth.service';
import { authSlice } from '../store/auth/auth.slice';
import { setItem, getItem, removeItem } from '../utils/storage.utils';

// Storage keys for authentication tokens
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Custom hook for managing authentication state and actions.
 * Provides login, logout functionality and access to authentication state.
 * 
 * @returns Object containing authentication state and methods
 */
const useAuth = () => {
  const dispatch = useDispatch();
  
  // Select auth state from Redux store
  const authState = useSelector((state: any) => state.auth);
  const { user, token, status, error } = authState;

  /**
   * Handles user login by authenticating credentials and managing tokens
   * 
   * @param credentials - User email and password
   * @returns Promise resolving to the login result
   */
  const handleLogin = async (credentials: AuthCredentials): Promise<void> => {
    try {
      // Attempt to login using auth service
      const response = await login(credentials);

      // Store tokens securely
      if (response.token) {
        setItem(AUTH_TOKEN_KEY, response.token);
      }
      if (response.refreshToken) {
        setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }

      // Update Redux store with auth state
      dispatch(authSlice.actions.setUser(response.user));
      dispatch(authSlice.actions.setToken(response.token));

    } catch (error) {
      // Clear any existing tokens on login failure
      removeItem(AUTH_TOKEN_KEY);
      removeItem(REFRESH_TOKEN_KEY);
      
      // Update error state
      dispatch(authSlice.actions.clearUser());
      throw error;
    }
  };

  /**
   * Handles user logout by clearing authentication state and tokens
   */
  const handleLogout = (): void => {
    // Clear stored tokens
    removeItem(AUTH_TOKEN_KEY);
    removeItem(REFRESH_TOKEN_KEY);

    // Clear auth state from Redux store
    dispatch(authSlice.actions.clearUser());
  };

  /**
   * Checks if user is currently authenticated
   * 
   * @returns boolean indicating authentication status
   */
  const isAuthenticated = (): boolean => {
    return Boolean(token && user);
  };

  /**
   * Retrieves the current authentication token
   * 
   * @returns Current auth token or null if not authenticated
   */
  const getAuthToken = (): string | null => {
    return getItem(AUTH_TOKEN_KEY);
  };

  /**
   * Retrieves the current refresh token
   * 
   * @returns Current refresh token or null if not authenticated
   */
  const getRefreshToken = (): string | null => {
    return getItem(REFRESH_TOKEN_KEY);
  };

  return {
    // Authentication state
    user,
    token,
    status,
    error,
    isAuthenticated: isAuthenticated(),

    // Authentication methods
    login: handleLogin,
    logout: handleLogout,
    getAuthToken,
    getRefreshToken
  };
};

export default useAuth;