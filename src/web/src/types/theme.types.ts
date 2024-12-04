/**
 * @fileoverview Theme type definitions for the web application
 * 
 * Requirements Addressed:
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides type definitions to support system-default theme detection, manual theme toggle,
 *   persistent theme preference, and high contrast mode.
 */

/**
 * Defines the structure of a theme object containing essential visual properties
 * used throughout the application for consistent theming.
 * 
 * @property primaryColor - The main brand color used for primary UI elements
 * @property secondaryColor - The secondary brand color used for accents and highlights
 * @property backgroundColor - The base background color for the application
 * @property textColor - The default text color
 * @property borderColor - The color used for borders and dividers
 */
export type ThemeType = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
};