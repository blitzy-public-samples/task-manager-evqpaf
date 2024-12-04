/**
 * Jest Configuration for Web Application
 * 
 * Requirements Addressed:
 * - Testing Configuration (Technical Specification/4.5 Development & Deployment/Testing)
 *   Defines the Jest configuration for unit and integration testing in the web application.
 * 
 * Human Tasks:
 * - Verify Node.js version compatibility with Jest configuration
 * - Ensure all test files follow the *.test.ts/*.test.tsx naming convention
 * - Configure code coverage thresholds based on project requirements
 */

// jest v29.0.0
// ts-jest v29.0.0
import type { Config } from 'jest';
import { compilerOptions } from './tsconfig.json';

/**
 * Processes tsconfig paths to Jest moduleNameMapper format
 * Converts TypeScript path aliases to Jest compatible format
 */
function createModuleNameMapper(paths: Record<string, string[]>) {
  const moduleNameMapper: Record<string, string> = {};
  
  for (const [alias, [path]] of Object.entries(paths)) {
    // Convert TypeScript paths to Jest format
    const key = `^${alias.replace('/*', '/(.*)$')}`;
    const value = `<rootDir>/${path.replace('/*', '/$1')}`;
    moduleNameMapper[key] = value;
  }

  return moduleNameMapper;
}

/**
 * Jest configuration object
 * Defines testing environment, module resolution, and other testing parameters
 */
const jestConfig: Config = {
  // Specify test environment
  testEnvironment: 'jsdom',

  // TypeScript configuration
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.json'
    }]
  },

  // Module resolution
  moduleNameMapper: {
    // Handle path aliases from tsconfig
    ...createModuleNameMapper(compilerOptions.paths),
    // Handle static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.test.{ts,tsx}'
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Performance and debugging
  verbose: true,
  testTimeout: 10000,
  maxWorkers: '50%',

  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],

  // Global configuration
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      isolatedModules: true
    }
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/coverage/'
  ],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};

export default jestConfig;