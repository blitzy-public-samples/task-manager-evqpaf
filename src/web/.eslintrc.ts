/**
 * ESLint Configuration for Web Application
 * 
 * Required Dependencies:
 * - eslint@^8.0.0
 * - @typescript-eslint/eslint-plugin@^5.0.0
 * - prettier@^2.0.0
 * 
 * Human Tasks:
 * 1. Ensure all required dependencies are installed in package.json
 * 2. Configure your IDE/editor to use ESLint for real-time linting
 * 3. Set up a pre-commit hook to run ESLint before commits
 * 4. Verify that .eslintignore is properly configured if needed
 */

// Requirement: Code Quality and Linting
// Location: Technical Specification/4.5 Development & Deployment/Development Tools
const eslintConfig = {
    // Environment configuration
    env: {
        browser: true,  // Enable browser global variables
        es2022: true,   // Enable ES2022 features
        node: true      // Enable Node.js global variables and scope
    },

    // Extended configurations
    extends: [
        'eslint:recommended',                    // ESLint recommended rules
        'plugin:@typescript-eslint/recommended', // TypeScript specific recommended rules
        'prettier'                               // Prettier formatting rules
    ],

    // TypeScript parser configuration
    parser: '@typescript-eslint/parser',

    // Parser options for modern JavaScript features
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true  // Enable JSX parsing
        }
    },

    // ESLint plugins
    plugins: [
        '@typescript-eslint',  // TypeScript linting plugin
        'prettier'            // Prettier plugin for ESLint
    ],

    // Custom rule configurations
    rules: {
        // Enforce Prettier formatting rules
        'prettier/prettier': 'error',

        // Warn about unused variables, ignore parameters starting with underscore
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_'
            }
        ],

        // Warn about console statements (should be removed in production)
        'no-console': 'warn',

        // Error on debugger statements (must not be committed)
        'no-debugger': 'error'
    }
};

export default eslintConfig;