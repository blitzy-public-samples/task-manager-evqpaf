/**
 * Theme Redux Slice
 * 
 * Requirements Addressed:
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides system-default theme detection, manual theme toggle, persistent theme preference,
 *   and high contrast mode.
 * 
 * Human Tasks:
 * - Verify that localStorage is available in target browsers
 * - Ensure theme changes are properly reflected in the UI
 * - Test theme persistence across page reloads
 */

// @reduxjs/toolkit version 1.9.5
import { createSlice } from '@reduxjs/toolkit';
import { ThemeType } from '../../types/theme.types';
import { LIGHT_THEME, DARK_THEME } from '../../constants/theme.constants';
import { setItem, getItem } from '../../utils/storage.utils';

/**
 * Storage key for persisting theme preference
 */
const THEME_STORAGE_KEY = 'theme_preference';

/**
 * Interface defining the structure of the theme state
 */
interface ThemeState {
  theme: ThemeType;
}

/**
 * Retrieve the initial theme from storage or system preference
 */
function getInitialTheme(): ThemeType {
  // First check if there's a stored preference
  const storedTheme = getItem(THEME_STORAGE_KEY);
  if (storedTheme) {
    return storedTheme;
  }

  // If no stored preference, check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return DARK_THEME;
  }

  // Default to light theme
  return LIGHT_THEME;
}

/**
 * Initial state for the theme slice
 */
const initialState: ThemeState = {
  theme: getInitialTheme()
};

/**
 * Redux slice for managing theme state
 */
export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Toggles between light and dark themes
     * Persists the selection in localStorage
     */
    toggleTheme: (state) => {
      // Toggle between light and dark themes
      const newTheme = state.theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
      
      // Update state
      state.theme = newTheme;
      
      // Persist theme preference
      setItem(THEME_STORAGE_KEY, newTheme);
    }
  }
});

// Export actions and reducer
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;