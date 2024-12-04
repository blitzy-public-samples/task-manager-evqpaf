/**
 * Global Test Setup Configuration
 * 
 * Requirements Addressed:
 * - Testing Configuration (Technical Specification/4.5 Development & Deployment/Testing)
 *   Sets up the global testing environment for Jest, including mock server initialization
 *   and global hooks.
 * 
 * Human Tasks:
 * - Verify Jest configuration in package.json includes this setup file
 * - Ensure all test files follow the established testing patterns
 * - Monitor mock server warnings for unhandled requests during testing
 */

// @jest/globals v29.0.0
import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { initializeMockServer } from './mocks/server';

/**
 * Configures the global testing environment by initializing the mock server
 * and setting up Jest hooks for consistent test execution.
 * 
 * This function:
 * 1. Initializes the MSW mock server for API request interception
 * 2. Sets up global Jest hooks for server lifecycle management
 * 3. Ensures clean server state between tests
 */
export const setupTests = (): void => {
  // Initialize the mock server instance
  const server = initializeMockServer();

  // Global setup hook - runs once before all tests
  beforeAll(() => {
    // Server initialization is handled within initializeMockServer
    // Additional global setup can be added here if needed
  });

  // Cleanup hook - runs after each test
  afterEach(() => {
    // Server handler reset is handled within initializeMockServer
    // Additional per-test cleanup can be added here if needed
  });

  // Global teardown hook - runs once after all tests
  afterAll(() => {
    // Server cleanup is handled within initializeMockServer
    // Additional global teardown can be added here if needed
  });
};