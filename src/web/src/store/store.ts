/**
 * Redux Store Configuration
 * 
 * Requirements Addressed:
 * - State Management (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides a centralized state management solution for handling application-wide state,
 *   including authentication, projects, tasks, and theme preferences.
 * 
 * Human Tasks:
 * - Verify Redux DevTools configuration for production environment
 * - Ensure proper error tracking middleware is configured
 * - Review middleware configuration for performance optimization
 */

// @reduxjs/toolkit v1.9.5
import { configureStore } from '@reduxjs/toolkit';

// Import reducers from their respective slices
import { authReducer } from './auth/auth.slice';
import { projectReducer } from './project/project.slice';
import { taskReducer } from './task/task.slice';
import { themeSlice } from './theme/theme.slice';

/**
 * Configure and create the Redux store with combined reducers and middleware
 * 
 * The store combines the following slices:
 * - auth: Handles authentication state and user session
 * - projects: Manages project-related state
 * - tasks: Handles task management state
 * - theme: Manages application theme preferences
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    theme: themeSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure middleware options
      serializableCheck: {
        // Ignore certain action types that may contain non-serializable data
        ignoredActions: ['persist/PERSIST'],
        // Ignore certain paths in the state that may contain non-serializable data
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt']
      },
      // Enable immutability checks in development
      immutableCheck: process.env.NODE_ENV === 'development',
      // Enable thunk middleware for async actions
      thunk: true
    }),
  // Enable Redux DevTools in development only
  devTools: process.env.NODE_ENV === 'development'
});

// Export store type for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the configured store as default
export default store;