/**
 * Mock Server Configuration
 * 
 * Requirements Addressed:
 * - Testing Requirements (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
 *   Provides a mock server to simulate API responses for testing purposes.
 * 
 * Human Tasks:
 * - Verify mock server is properly configured in test setup files
 * - Ensure all required API endpoints have corresponding mock handlers
 * - Update mock handlers when new API endpoints are added
 */

// msw v0.49.3
import { setupServer } from 'msw/node';
import { mockGetTasksHandler, mockCreateTaskHandler } from './handlers';

/**
 * Initialize and configure the mock service worker server with all
 * required request handlers for API testing.
 * 
 * This server intercepts all API requests during testing and responds
 * with predefined mock data to ensure consistent and controlled test conditions.
 */
export const initializeMockServer = () => {
  // Create mock server instance with all request handlers
  const server = setupServer(
    mockGetTasksHandler,
    mockCreateTaskHandler
  );

  // Configure server behavior
  beforeAll(() => {
    // Start intercepting requests before all tests
    server.listen({
      onUnhandledRequest: 'warn' // Warn about unhandled requests
    });
  });

  afterEach(() => {
    // Reset handlers after each test for clean state
    server.resetHandlers();
  });

  afterAll(() => {
    // Clean up after all tests are complete
    server.close();
  });

  return server;
};