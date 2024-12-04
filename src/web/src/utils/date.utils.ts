/**
 * Date Utility Functions
 * 
 * Requirements Addressed:
 * - Utility Functions for Date Manipulation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides reusable date manipulation functions to support consistent formatting and validation across the application.
 * 
 * Human Tasks:
 * - Verify date format patterns match the project's localization requirements
 * - Ensure timezone handling aligns with application requirements
 * - Confirm date validation rules meet business requirements
 */

import { CommonStatus } from '../types/common.types';
import { BASE_API_URL } from '../constants/api.constants';
import { capitalize } from './string.utils';

/**
 * Date format patterns for consistent date formatting across the application
 */
const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  MEDIUM: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMMM DD, YYYY HH:mm:ss',
  ISO: 'YYYY-MM-DD'
} as const;

/**
 * Month names for date formatting
 */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Short month names for date formatting
 */
const SHORT_MONTHS = MONTHS.map(month => month.slice(0, 3));

/**
 * Formats a given date object into a human-readable string.
 * 
 * @param date - The date object to format
 * @param format - The desired output format (defaults to 'MEDIUM')
 * @returns The formatted date string
 */
export function formatDate(date: Date, format: keyof typeof DATE_FORMATS = 'MEDIUM'): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Pad single digits with leading zero
  const pad = (num: number): string => num.toString().padStart(2, '0');

  switch (format) {
    case 'SHORT':
      return `${pad(month + 1)}/${pad(day)}/${year}`;
    
    case 'MEDIUM':
      return `${SHORT_MONTHS[month]} ${day}, ${year}`;
    
    case 'LONG':
      return `${MONTHS[month]} ${day}, ${year}`;
    
    case 'TIME':
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    
    case 'DATETIME':
      return `${MONTHS[month]} ${day}, ${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    
    case 'ISO':
      return `${year}-${pad(month + 1)}-${pad(day)}`;
    
    default:
      return `${SHORT_MONTHS[month]} ${day}, ${year}`;
  }
}

/**
 * Checks if a given date falls on a weekend (Saturday or Sunday).
 * 
 * @param date - The date to check
 * @returns True if the date is a weekend, otherwise false
 */
export function isWeekend(date: Date): boolean {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  const day = date.getDay();
  // 0 is Sunday, 6 is Saturday
  return day === 0 || day === 6;
}

/**
 * Adds a specified number of days to a given date.
 * Creates a new Date object without modifying the original.
 * 
 * @param date - The base date
 * @param days - Number of days to add (can be negative)
 * @returns A new date object with the added days
 */
export function addDays(date: Date, days: number): Date {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return new Date();
  }

  if (!Number.isInteger(days)) {
    days = Math.floor(days);
  }

  // Create a new date object to avoid mutating the input
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  
  return result;
}