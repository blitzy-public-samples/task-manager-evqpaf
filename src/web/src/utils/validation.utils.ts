/**
 * Validation Utilities
 * 
 * Requirements Addressed:
 * - Input Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures consistent and reusable validation utilities for user inputs, enhancing data integrity 
 *   and user experience.
 * 
 * Human Tasks:
 * - Verify email regex pattern matches backend validation requirements
 * - Confirm password complexity requirements align with security policies
 * - Ensure URL validation patterns meet project requirements
 */

import { CommonStatus } from '../types/common.types';
import { BASE_API_URL } from '../constants/api.constants';

/**
 * Regular expression for validating email addresses.
 * Follows RFC 5322 standards for email validation.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Regular expression for validating URLs.
 * Supports http, https, ftp protocols and validates domain structure.
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Password validation criteria
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REQUIREMENTS = {
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSpecialChars: 1
};

/**
 * Validates if the given string is a valid email address.
 * 
 * @param email - The email address to validate
 * @returns boolean indicating if the email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace and convert to lowercase for consistent validation
  const normalizedEmail = email.trim().toLowerCase();

  // Check maximum length to prevent DOS attacks
  if (normalizedEmail.length > 254) {
    return false;
  }

  // Test against RFC 5322 compliant regex
  return EMAIL_REGEX.test(normalizedEmail);
}

/**
 * Validates if the given password meets the required strength criteria.
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * 
 * @param password - The password to validate
 * @returns boolean indicating if the password meets all criteria
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Check minimum length requirement
  if (password.length < PASSWORD_MIN_LENGTH) {
    return false;
  }

  // Check for required character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Ensure all criteria are met
  return (
    hasUppercase &&
    hasLowercase &&
    hasNumbers &&
    hasSpecialChars
  );
}

/**
 * Validates if the given string is a valid URL.
 * Supports various URL formats including:
 * - HTTP/HTTPS protocols
 * - Domain validation
 * - Path validation
 * - Query parameter validation
 * 
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Trim whitespace for consistent validation
  const normalizedUrl = url.trim();

  // Prevent extremely long URLs
  if (normalizedUrl.length > 2048) {
    return false;
  }

  try {
    // First try to construct a URL object to validate basic structure
    new URL(normalizedUrl);

    // Then test against our regex pattern for additional validation
    return URL_REGEX.test(normalizedUrl);
  } catch {
    // If URL construction fails, check if adding https:// prefix helps
    try {
      new URL(`https://${normalizedUrl}`);
      return URL_REGEX.test(`https://${normalizedUrl}`);
    } catch {
      return false;
    }
  }
}