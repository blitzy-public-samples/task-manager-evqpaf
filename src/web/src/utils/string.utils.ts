/**
 * String Utility Functions
 * 
 * Requirements Addressed:
 * - Utility Functions for String Manipulation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures consistent and reusable string manipulation utilities for formatting and validation purposes.
 * 
 * Human Tasks:
 * - Verify that string manipulation functions meet localization requirements
 * - Ensure truncation lengths align with UI design specifications
 */

import { CommonStatus } from '../types/common.types';
import { BASE_API_URL } from '../constants/api.constants';
import { ROUTES } from '../constants/routes.constants';
import { validateEmail } from './validation.utils';

/**
 * Capitalizes the first letter of a given string.
 * 
 * @param input - The string to capitalize
 * @returns The input string with the first letter capitalized
 */
export function capitalize(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Truncates a string to a specified length and appends an ellipsis if necessary.
 * 
 * @param input - The string to truncate
 * @param length - The maximum length of the resulting string (including ellipsis)
 * @returns The truncated string with an ellipsis if it exceeds the specified length
 */
export function truncate(input: string, length: number): string {
  if (!input || typeof input !== 'string' || length <= 0) {
    return '';
  }

  if (input.length <= length) {
    return input;
  }

  // Reserve 3 characters for the ellipsis
  const truncatedLength = length - 3;
  return `${input.slice(0, truncatedLength)}...`;
}

/**
 * Converts a given string to camelCase format.
 * Handles strings with spaces, hyphens, and underscores.
 * 
 * @param input - The string to convert to camelCase
 * @returns The input string converted to camelCase
 */
export function toCamelCase(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Split the string by spaces, hyphens, and underscores
  const words = input.split(/[\s-_]+/);

  // Convert first word to lowercase
  const firstWord = words[0].toLowerCase();

  // Capitalize first letter of remaining words and join
  const remainingWords = words
    .slice(1)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return [firstWord, ...remainingWords].join('');
}

/**
 * Converts a given string to snake_case format.
 * Handles camelCase, spaces, and hyphens.
 * 
 * @param input - The string to convert to snake_case
 * @returns The input string converted to snake_case
 */
export function toSnakeCase(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Replace spaces and hyphens with underscores
  let result = input.replace(/[\s-]+/g, '_');

  // Insert underscore before capital letters in camelCase
  result = result.replace(/([A-Z])/g, '_$1');

  // Convert to lowercase and remove any duplicate underscores
  result = result.toLowerCase().replace(/_+/g, '_');

  // Remove leading or trailing underscores
  return result.replace(/^_+|_+$/g, '');
}

/**
 * Checks if a string is empty or contains only whitespace.
 * 
 * @param input - The string to check
 * @returns True if the string is empty or contains only whitespace, otherwise false
 */
export function isEmptyOrWhitespace(input: string): boolean {
  if (typeof input !== 'string') {
    return true;
  }

  return input.trim().length === 0;
}