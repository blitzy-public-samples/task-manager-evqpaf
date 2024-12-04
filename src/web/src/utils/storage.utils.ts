/**
 * Storage Utility Functions
 * 
 * Requirements Addressed:
 * - Utility Functions for Storage Management (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides reusable storage management functions to support consistent data persistence and retrieval.
 * 
 * Human Tasks:
 * - Verify that localStorage/sessionStorage is available in the target browsers
 * - Ensure sensitive data is not stored in client-side storage
 * - Consider implementing encryption for stored data if required
 */

import { CommonStatus } from '../types/common.types';
import { BASE_API_URL } from '../constants/api.constants';
import { capitalize } from './string.utils';

/**
 * Stores a key-value pair in localStorage or sessionStorage.
 * Automatically serializes objects and arrays to JSON strings.
 * 
 * @param key - The key under which to store the value
 * @param value - The value to store (can be any JSON-serializable data)
 * @param useSession - If true, uses sessionStorage instead of localStorage
 */
export function setItem(key: string, value: any, useSession: boolean = false): void {
  try {
    // Validate storage availability
    const storage = useSession ? sessionStorage : localStorage;
    if (!storage) {
      console.error('Web Storage is not available');
      return;
    }

    // Validate key
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    // Prefix the key with BASE_API_URL to avoid conflicts
    const prefixedKey = `${BASE_API_URL}_${capitalize(key)}`;

    // Handle null/undefined values
    if (value === null || value === undefined) {
      storage.removeItem(prefixedKey);
      return;
    }

    // Serialize the value
    const serializedValue = JSON.stringify(value);
    storage.setItem(prefixedKey, serializedValue);
  } catch (error) {
    // Handle storage errors (e.g., quota exceeded)
    console.error('Storage operation failed:', error);
    
    // Attempt to clear some space if quota is exceeded
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        const storage = useSession ? sessionStorage : localStorage;
        // Remove items with INACTIVE status first
        for (let i = 0; i < storage.length; i++) {
          const storedKey = storage.key(i);
          if (storedKey) {
            const storedValue = storage.getItem(storedKey);
            if (storedValue) {
              try {
                const parsedValue = JSON.parse(storedValue);
                if (parsedValue?.status === CommonStatus.INACTIVE) {
                  storage.removeItem(storedKey);
                }
              } catch {
                // Skip invalid JSON
                continue;
              }
            }
          }
        }
      } catch {
        // If clearing space fails, give up
        console.error('Failed to clear storage space');
      }
    }
  }
}

/**
 * Retrieves a value from localStorage or sessionStorage by key.
 * Automatically deserializes JSON strings back to their original format.
 * 
 * @param key - The key of the value to retrieve
 * @param useSession - If true, uses sessionStorage instead of localStorage
 * @returns The stored value, or null if not found
 */
export function getItem(key: string, useSession: boolean = false): any {
  try {
    // Validate storage availability
    const storage = useSession ? sessionStorage : localStorage;
    if (!storage) {
      console.error('Web Storage is not available');
      return null;
    }

    // Validate key
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    // Prefix the key with BASE_API_URL to avoid conflicts
    const prefixedKey = `${BASE_API_URL}_${capitalize(key)}`;

    // Retrieve the stored value
    const storedValue = storage.getItem(prefixedKey);
    if (!storedValue) {
      return null;
    }

    // Attempt to parse the stored value
    try {
      return JSON.parse(storedValue);
    } catch {
      // If parsing fails, return the raw value
      return storedValue;
    }
  } catch (error) {
    console.error('Storage retrieval failed:', error);
    return null;
  }
}

/**
 * Removes a key-value pair from localStorage or sessionStorage.
 * 
 * @param key - The key of the item to remove
 * @param useSession - If true, uses sessionStorage instead of localStorage
 */
export function removeItem(key: string, useSession: boolean = false): void {
  try {
    // Validate storage availability
    const storage = useSession ? sessionStorage : localStorage;
    if (!storage) {
      console.error('Web Storage is not available');
      return;
    }

    // Validate key
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    // Prefix the key with BASE_API_URL to avoid conflicts
    const prefixedKey = `${BASE_API_URL}_${capitalize(key)}`;

    // Remove the item
    storage.removeItem(prefixedKey);
  } catch (error) {
    console.error('Storage removal failed:', error);
  }
}