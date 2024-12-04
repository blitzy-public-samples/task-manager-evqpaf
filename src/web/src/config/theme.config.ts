/**
 * Theme Configuration
 * 
 * Requirements Addressed:
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides system-default theme detection, manual theme toggle, persistent theme preference,
 *   and high contrast mode.
 * 
 * Human Tasks:
 * - Verify that theme changes are properly reflected across all components
 * - Ensure theme persistence works across browser sessions
 * - Test theme transitions for smooth user experience
 */

import { LIGHT_THEME, DARK_THEME } from '../constants/theme.constants';
import { ThemeType } from '../types/theme.types';
import { setItem, getItem } from '../utils/storage.utils';

// Storage key for theme persistence
const THEME_STORAGE_KEY = 'app_theme';

/**
 * Sets the current theme and persists it in localStorage.
 * Applies theme settings to the application by updating CSS variables
 * and storing the preference.
 * 
 * @param theme - The theme object containing color values
 */
export function setTheme(theme: ThemeType): void {
  try {
    // Validate theme object structure
    if (!theme || typeof theme !== 'object') {
      throw new Error('Invalid theme object provided');
    }

    // Validate required theme properties
    const requiredProperties = [
      'primaryColor',
      'secondaryColor',
      'backgroundColor',
      'textColor',
      'borderColor'
    ];

    for (const prop of requiredProperties) {
      if (!(prop in theme)) {
        throw new Error(`Missing required theme property: ${prop}`);
      }
    }

    // Apply theme to document root
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-color', theme.borderColor);

    // Add transition for smooth theme switching
    root.style.setProperty('--theme-transition', 'all 0.3s ease-in-out');

    // Persist theme preference
    setItem(THEME_STORAGE_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.backgroundColor);
    }
  } catch (error) {
    console.error('Failed to set theme:', error);
    // Fallback to light theme in case of error
    setTheme(LIGHT_THEME);
  }
}

/**
 * Retrieves the persisted theme from localStorage or defaults to the light theme.
 * Also checks system preference for dark mode if no theme is persisted.
 * 
 * @returns The retrieved theme object or default light theme
 */
export function getTheme(): ThemeType {
  try {
    // Attempt to retrieve persisted theme
    const persistedTheme = getItem(THEME_STORAGE_KEY);
    if (persistedTheme) {
      return persistedTheme as ThemeType;
    }

    // Check system preference for dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDarkMode ? DARK_THEME : LIGHT_THEME;
  } catch (error) {
    console.error('Failed to retrieve theme:', error);
    // Fallback to light theme in case of error
    return LIGHT_THEME;
  }
}