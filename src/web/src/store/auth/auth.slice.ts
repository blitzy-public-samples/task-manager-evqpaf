/**
 * Authentication Redux Slice
 * 
 * Requirements Addressed:
 * - State Management (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides a centralized state management solution for handling authentication-related state,
 *   including user login, logout, and token handling.
 * 
 * Human Tasks:
 * - Verify token storage strategy aligns with security requirements
 * - Ensure proper token refresh mechanism is implemented
 * - Configure token expiration handling
 */

// @reduxjs/toolkit v1.9.5
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthInterface } from '../../interfaces/auth.interface';
import { makeApiRequest } from '../../utils/api.utils';
import { BASE_API_URL } from '../../constants/api.constants';

// Define the state interface for the auth slice
interface AuthState {
  user: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null
};

/**
 * Async thunk for user login
 * Handles the authentication process by sending credentials to the API
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: AuthInterface, { rejectWithValue }) => {
    try {
      const response = await makeApiRequest(`${BASE_API_URL}/auth/login`, {
        method: 'POST',
        data: credentials,
        validateAuth: true
      });

      // Ensure the response contains the expected data
      if (!response.token || !response.user) {
        throw new Error('Invalid response format from authentication server');
      }

      return {
        user: response.user,
        token: response.token
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Authentication failed');
    }
  }
);

/**
 * Auth slice definition with reducers and extra reducers for async actions
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Sets the authenticated user's information in the state
     */
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },

    /**
     * Clears the authenticated user's information and token from the state
     */
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },

    /**
     * Sets the authentication token in the state
     */
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },

    /**
     * Clears any error messages in the state
     */
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle loginUser pending state
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // Handle loginUser fulfilled state
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      // Handle loginUser rejected state
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Authentication failed';
        state.user = null;
        state.token = null;
      });
  }
});

// Export actions
export const { setUser, clearUser, setToken, clearError } = authSlice.actions;

// Export reducer
export const authReducer = authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;