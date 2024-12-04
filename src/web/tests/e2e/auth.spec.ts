/**
 * End-to-End Authentication Tests
 * 
 * Requirements Addressed:
 * - Authentication Testing (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
 *   Validates the authentication flow, including login, token validation, and access control.
 * 
 * Human Tasks:
 * - Verify test environment variables are properly configured
 * - Ensure test user credentials are maintained securely
 * - Review test coverage requirements for authentication flows
 */

// vitest v0.34.0
import { test, expect } from 'vitest';
import { login } from '../../src/services/auth.service';
import { AUTH_API_ENDPOINT } from '../../src/config/auth.config';
import { initializeMockServer } from '../mocks/server';
import { mockGetTasksHandler } from '../mocks/handlers';
import { makeApiRequest } from '../../src/utils/api.utils';
import { validateEmail } from '../../src/utils/validation.utils';

// Initialize mock server for tests
const server = initializeMockServer();

// Test user credentials
const testUser = {
  email: 'test.user@example.com',
  password: 'Test@123456'
};

// Mock authentication token
const mockAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

test('complete authentication flow test', async () => {
  // Step 1: Validate email format
  expect(validateEmail(testUser.email)).toBe(true);

  // Step 2: Test login functionality
  const loginResponse = await login(testUser);
  expect(loginResponse).toBeDefined();
  expect(loginResponse.token).toBeDefined();
  expect(typeof loginResponse.token).toBe('string');

  // Step 3: Verify token storage
  const storedToken = localStorage.getItem('auth_token');
  expect(storedToken).toBe(loginResponse.token);

  // Step 4: Test authenticated API request
  const tasksResponse = await makeApiRequest('/tasks', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${loginResponse.token}`
    }
  });
  expect(tasksResponse).toBeDefined();
  expect(Array.isArray(tasksResponse.data)).toBe(true);

  // Step 5: Test token validation
  const validationResponse = await makeApiRequest(`${AUTH_API_ENDPOINT}/validate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${loginResponse.token}`
    }
  });
  expect(validationResponse.valid).toBe(true);
});

test('login with invalid credentials', async () => {
  const invalidUser = {
    email: 'invalid@example.com',
    password: 'wrong'
  };

  await expect(login(invalidUser)).rejects.toThrow();
  expect(localStorage.getItem('auth_token')).toBeNull();
});

test('access control with invalid token', async () => {
  // Attempt to access protected resource with invalid token
  await expect(
    makeApiRequest('/tasks', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid_token'
      }
    })
  ).rejects.toThrow();
});

test('token validation with expired token', async () => {
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired';

  await expect(
    makeApiRequest(`${AUTH_API_ENDPOINT}/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${expiredToken}`
      }
    })
  ).rejects.toThrow();
});

test('login with malformed email', async () => {
  const userWithInvalidEmail = {
    email: 'invalid-email',
    password: testUser.password
  };

  expect(validateEmail(userWithInvalidEmail.email)).toBe(false);
  await expect(login(userWithInvalidEmail)).rejects.toThrow();
});

test('authentication persistence', async () => {
  // Login and store token
  const loginResponse = await login(testUser);
  expect(loginResponse.token).toBeDefined();

  // Simulate page reload by clearing memory but not localStorage
  server.resetHandlers();

  // Attempt to make authenticated request
  const tasksResponse = await makeApiRequest('/tasks', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${loginResponse.token}`
    }
  });
  expect(tasksResponse).toBeDefined();
  expect(Array.isArray(tasksResponse.data)).toBe(true);
});

test('concurrent authentication requests', async () => {
  // Attempt multiple concurrent login requests
  const loginPromises = Array(3).fill(null).map(() => login(testUser));
  const responses = await Promise.all(loginPromises);

  // Verify all requests succeeded with valid tokens
  responses.forEach(response => {
    expect(response.token).toBeDefined();
    expect(typeof response.token).toBe('string');
  });
});