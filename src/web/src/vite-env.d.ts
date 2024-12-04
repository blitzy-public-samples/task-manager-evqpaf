/// <reference types="vite/client" /> // vite ^4.0.0

/**
 * Requirements Addressed:
 * - TypeScript Environment Declarations (Technical Specification/4.1 Programming Languages)
 *   Defines TypeScript types for the Vite environment to ensure type safety and compatibility.
 */

/**
 * Interface defining the type-safe environment variables used in the Vite build process.
 * All environment variables must be prefixed with VITE_ to be exposed to the client.
 */
interface ViteEnv {
  /**
   * Base URL for API endpoints
   */
  readonly VITE_API_BASE_URL: string;

  /**
   * Application title used across the web application
   */
  readonly VITE_APP_TITLE: string;

  /**
   * Application version for tracking builds and releases
   */
  readonly VITE_APP_VERSION: string;
}

/**
 * Augment the ImportMetaEnv interface from Vite to include our custom environment variables
 */
interface ImportMetaEnv extends ViteEnv {}

/**
 * Augment the ImportMeta interface from Vite to ensure proper typing of import.meta.env
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}