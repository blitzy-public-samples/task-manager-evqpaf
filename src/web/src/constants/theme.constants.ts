/**
 * @fileoverview Theme constants defining color palettes for light and dark themes
 * 
 * Requirements Addressed:
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides color palette constants for system-default theme detection, manual theme toggle,
 *   persistent theme preference, and high contrast mode.
 */

import { ThemeType } from '../types/theme.types';

/**
 * Light theme color palette implementing the ThemeType interface.
 * Uses a bright, clean color scheme with blue as the primary color.
 */
export const LIGHT_THEME: ThemeType = {
  primaryColor: '#2196F3',   // Material Blue 500
  secondaryColor: '#64B5F6', // Material Blue 300
  backgroundColor: '#FFFFFF', // Pure White
  textColor: '#333333',      // Dark Gray
  borderColor: '#E0E0E0',    // Light Gray
};

/**
 * Dark theme color palette implementing the ThemeType interface.
 * Uses a darker variation of the light theme colors for reduced eye strain
 * while maintaining brand consistency.
 */
export const DARK_THEME: ThemeType = {
  primaryColor: '#64B5F6',   // Material Blue 300 (lighter for dark theme)
  secondaryColor: '#2196F3', // Material Blue 500
  backgroundColor: '#1E1E1E', // Dark Gray
  textColor: '#FFFFFF',      // Pure White
  borderColor: '#424242',    // Medium Gray
};