/**
 * @fileoverview Custom React hook for managing and toggling the application's theme
 * 
 * Requirements Addressed:
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides system-default theme detection, manual theme toggle, persistent theme preference,
 *   and high contrast mode.
 * 
 * Human Tasks:
 * - Verify theme changes are properly reflected across all components
 * - Test theme persistence across browser sessions
 * - Ensure smooth theme transitions in the UI
 */

import { useState, useCallback, useEffect } from 'react';
import { ThemeType } from '../types/theme.types';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme.constants';
import { getTheme, setTheme } from '../config/theme.config';

/**
 * Custom React hook for managing the application's theme.
 * Provides functionality to:
 * - Get the current theme
 * - Toggle between light and dark themes
 * - Persist theme preferences
 * - Sync with system theme preferences
 * 
 * @returns An object containing the current theme and a function to toggle between themes
 */
const useTheme = () => {
  // Initialize theme state with persisted theme or system preference
  const [theme, setThemeState] = useState<ThemeType>(() => getTheme());

  // Effect to listen for system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      // Only update theme if no user preference is stored
      if (!localStorage.getItem('app_theme')) {
        const newTheme = e.matches ? DARK_THEME : LIGHT_THEME;
        setThemeState(newTheme);
        setTheme(newTheme);
      }
    };

    // Add listener for theme preference changes
    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  /**
   * Toggles between light and dark themes.
   * Updates both the state and persisted theme preference.
   */
  const toggleTheme = useCallback(() => {
    setThemeState(currentTheme => {
      const newTheme = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
      setTheme(newTheme);
      return newTheme;
    });
  }, []);

  return {
    theme,
    toggleTheme
  };
};

export default useTheme;