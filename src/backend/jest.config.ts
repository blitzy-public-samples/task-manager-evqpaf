// Jest configuration v29.0.0
// ts-jest v29.0.0

/**
 * Human Tasks:
 * 1. Ensure Node.js version 18+ is installed (required for ES2022 support)
 * 2. Create tests/setup.ts file for global test setup if not exists
 * 3. Verify that @shared path alias matches the project's directory structure
 */

import type { Config } from 'jest';
import { compilerOptions } from './tsconfig.json';

/**
 * Requirement: Testing Framework Configuration
 * Location: Technical Specification/4.5 Development & Deployment/Testing
 * Description: Configures Jest for unit and integration testing of backend services
 */
const jestConfig: Config = {
  // Use Node.js as the test environment since this is a backend service
  testEnvironment: 'node',

  // Configure TypeScript transformation using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Configure module name mapping to match TypeScript path aliases
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },

  // Global test setup file
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Additional Jest configuration for robust testing
  verbose: true,
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/setup.ts'
  ],

  // TypeScript-specific configuration
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      diagnostics: true,
    },
  },

  // Module resolution settings
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Root directory for Jest to search for files
  rootDir: '.',

  // Timeout settings for tests
  testTimeout: 10000,

  // Clear mocks between each test
  clearMocks: true,
  
  // Error handling
  bail: 1,
  errorOnDeprecated: true,
};

export default jestConfig;