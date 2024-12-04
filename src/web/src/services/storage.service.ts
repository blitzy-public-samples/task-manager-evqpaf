/**
 * Storage Service
 * 
 * Requirements Addressed:
 * - Utility Functions for Storage Management (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides reusable storage management functions to support consistent data persistence and retrieval.
 * 
 * Human Tasks:
 * - Verify that localStorage/sessionStorage is available in target browsers
 * - Ensure sensitive data is not stored in client-side storage
 * - Consider implementing encryption for stored data if required
 * - Review storage quota limits and implement cleanup strategies if needed
 */

import { setItem, getItem, removeItem } from '../utils/storage.utils';
import { CommonStatus } from '../types/common.types';

/**
 * Saves data to web storage with status validation.
 * 
 * @param key - The key under which to store the value
 * @param value - The value to store (can be any JSON-serializable data)
 * @param useSession - If true, uses sessionStorage instead of localStorage
 * @param status - Optional status to validate the data (defaults to ACTIVE)
 */
export function saveData(
  key: string,
  value: any,
  useSession: boolean = false,
  status: string = CommonStatus.ACTIVE
): void {
  // Validate status
  if (status !== CommonStatus.ACTIVE && status !== CommonStatus.INACTIVE) {
    console.error('Invalid status provided for storage');
    return;
  }

  // Prepare data object with status
  const dataWithStatus = {
    data: value,
    status,
    timestamp: new Date().toISOString()
  };

  // Store the data using the storage utility
  setItem(key, dataWithStatus, useSession);
}

/**
 * Loads data from web storage by key.
 * 
 * @param key - The key of the value to retrieve
 * @param useSession - If true, uses sessionStorage instead of localStorage
 * @returns The stored value, or null if not found
 */
export function loadData(key: string, useSession: boolean = false): any {
  // Retrieve the stored data
  const storedData = getItem(key, useSession);

  if (!storedData) {
    return null;
  }

  // Return the actual data value from the stored object
  return storedData.data;
}

/**
 * Deletes data from web storage by key.
 * 
 * @param key - The key of the item to remove
 * @param useSession - If true, uses sessionStorage instead of localStorage
 */
export function deleteData(key: string, useSession: boolean = false): void {
  // Remove the item using the storage utility
  removeItem(key, useSession);
}