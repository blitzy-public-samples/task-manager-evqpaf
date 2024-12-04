/**
 * Theme Configuration
 * 
 * Requirements Addressed:
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides system-default theme detection, manual theme toggle, persistent theme preference,
 *   and high contrast mode.
 * 
 * Human Tasks:
 * - Verify CSS variable names match component styling requirements
 * - Test theme transitions across different browsers
 * - Ensure theme colors meet WCAG accessibility guidelines
 */

import { ThemeType } from '../types/theme.types';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme.constants';
import { setTheme, getTheme } from '../config/theme.config';

/**
 * Applies the given theme to the application by updating CSS variables.
 * This function sets CSS custom properties on the document root element
 * to enable consistent theming across the application.
 * 
 * @param theme - The theme object containing color values to apply
 */
export function applyTheme(theme: ThemeType): void {
  try {
    // Validate theme object
    if (!theme || typeof theme !== 'object') {
      throw new Error('Invalid theme object provided');
    }

    // Get the document root element
    const root = document.documentElement;

    // Apply each theme property as a CSS variable
    Object.entries(theme).forEach(([property, value]) => {
      // Convert camelCase to kebab-case for CSS variable names
      const cssVariable = `--${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVariable, value);
    });

    // Add smooth transition for theme changes
    root.style.setProperty('transition', 'background-color 0.3s ease-in-out, color 0.3s ease-in-out');

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.backgroundColor);
    }

    // Add theme-specific class to body for conditional styling
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(
      theme === LIGHT_THEME ? 'light-theme' : 'dark-theme'
    );

  } catch (error) {
    console.error('Failed to apply theme:', error);
    // Fallback to light theme in case of error
    applyTheme(LIGHT_THEME);
  }
}

// Initialize theme on module load
(() => {
  try {
    const initialTheme = getTheme();
    applyTheme(initialTheme);
  } catch (error) {
    console.error('Failed to initialize theme:', error);
    // Fallback to light theme
    applyTheme(LIGHT_THEME);
  }
})();