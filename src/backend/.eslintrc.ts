/**
 * ESLint Configuration for Task Management System Backend Services
 * 
 * Requirements Addressed:
 * - Code Quality and Maintainability (Technical Specification/4.5 Development & Deployment/Development Tools)
 *   Implements strict linting rules to ensure consistent code style and maintainable codebase
 * 
 * Dependencies:
 * - eslint@^8.0.0
 * - @typescript-eslint/parser@^5.0.0
 * - @typescript-eslint/eslint-plugin@^5.0.0
 * 
 * Human Tasks:
 * 1. Ensure all required ESLint dependencies are installed in package.json
 * 2. Configure your IDE/editor to use this ESLint configuration
 * 3. Set up pre-commit hooks to run ESLint before commits (recommended)
 */

const eslintConfig = {
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        // Warn on console statements to prevent debug logs in production
        "no-console": "warn",
        
        // Enforce semicolons at the end of statements
        "semi": ["error", "always"],
        
        // Enforce double quotes for string literals
        "quotes": ["error", "double"],
        
        // Error on unused variables to keep code clean
        "@typescript-eslint/no-unused-vars": ["error"],

        // Additional TypeScript-specific rules for better code quality
        "@typescript-eslint/explicit-function-return-type": ["error", {
            allowExpressions: true,
            allowTypedFunctionExpressions: true
        }],
        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "explicit"
        }],
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-interface": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/array-type": ["error", {
            default: "array-simple"
        }],
        "@typescript-eslint/consistent-type-assertions": ["error", {
            assertionStyle: "as",
            objectLiteralTypeAssertions: "never"
        }],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "interface",
                "format": ["PascalCase"],
                "prefix": ["I"]
            },
            {
                "selector": "class",
                "format": ["PascalCase"]
            }
        ],
        
        // General code quality rules
        "no-multiple-empty-lines": ["error", { "max": 1 }],
        "no-trailing-spaces": "error",
        "eol-last": ["error", "always"],
        "comma-dangle": ["error", "never"],
        "max-len": ["error", { 
            "code": 120,
            "ignoreComments": true,
            "ignoreStrings": true,
            "ignoreTemplateLiterals": true
        }],
        "complexity": ["error", 10],
        "max-depth": ["error", 3],
        "max-params": ["error", 4]
    },
    env: {
        "node": true,
        "jest": true,
        "es2021": true
    },
    parserOptions: {
        "ecmaVersion": 2021,
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    ignorePatterns: [
        "dist",
        "node_modules",
        "coverage",
        "*.js"
    ]
};

export default eslintConfig;