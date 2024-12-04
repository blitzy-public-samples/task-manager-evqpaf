/**
 * Font asset management module for the web application
 * 
 * Requirements Addressed:
 * - Accessibility (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures WCAG 2.1 Level AA compliance with optimized typography for accessibility
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides consistent font-family settings across light and dark themes
 * 
 * Human Tasks:
 * 1. Ensure Roboto font is properly included in the project:
 *    - Add Roboto font files (woff2, woff) to the assets directory
 *    - Configure bundler to handle font files
 *    - Verify font loading performance and implement font-display strategy
 * 2. Validate font rendering across different browsers and devices
 * 3. Consider implementing font preloading for performance optimization
 */

// Import CSS variables for font-family
// Note: Relative path from current file to variables.css
import '../../../styles/variables.css';

/**
 * Default font family constant for the application.
 * Uses system fonts as fallbacks in case Roboto fails to load.
 * Follows WCAG 2.1 Level AA guidelines for typography accessibility.
 */
export const FONT_FAMILY = 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';

/**
 * Retrieves the default font-family from CSS variables.
 * This function provides a programmatic way to access the font-family
 * value defined in the global CSS variables.
 * 
 * @returns {string} The default font-family value from CSS variables
 */
export const getFontFamily = (): string => {
  // Access the CSS variable using getComputedStyle
  const styles = getComputedStyle(document.documentElement);
  return styles.getPropertyValue('--font-family').trim() || FONT_FAMILY;
};