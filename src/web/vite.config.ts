/**
 * Vite Configuration
 * 
 * Requirements Addressed:
 * - Frontend Build and Development (Technical Specification/4.5 Development & Deployment/Development Tools)
 *   Configures Vite build tool for optimal development and production builds.
 * 
 * Human Tasks:
 * - Verify build output directory matches deployment requirements
 * - Ensure environment variables are properly configured in deployment environment
 * - Review build optimization settings for production deployment
 */

// vite v4.0.0
import { defineConfig } from 'vite';
// @vitejs/plugin-react v4.0.0
import react from '@vitejs/plugin-react';
// vite-tsconfig-paths v4.2.0
import tsconfigPaths from 'vite-tsconfig-paths';
// vite-plugin-environment v1.1.3
import environment from 'vite-plugin-environment';
import { resolve } from 'path';

// Import configuration functions
import { getApiConfig } from './src/config/api.config';
import { getAuthConfig } from './src/config/auth.config';
import { getTheme } from './src/config/theme.config';

/**
 * Configures Vite build tool with plugins, environment variables, and optimizations.
 * Implements the build and development configuration requirements from the technical specification.
 */
export default defineConfig(({ command, mode }) => {
  // Get configurations
  const apiConfig = getApiConfig();
  const authConfig = getAuthConfig();
  const themeConfig = getTheme();

  return {
    // Base configuration
    base: '/',
    
    // Configure plugins
    plugins: [
      // React plugin with automatic runtime and Fast Refresh
      react({
        fastRefresh: true,
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      }),
      
      // TypeScript paths resolution
      tsconfigPaths(),
      
      // Environment variables plugin
      environment('all', { prefix: 'VITE_' })
    ],

    // Environment variables
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(apiConfig.baseUrl),
      'process.env.VITE_AUTH_ENDPOINT': JSON.stringify(authConfig.apiEndpoint),
      'process.env.VITE_THEME': JSON.stringify(themeConfig)
    },

    // Build configuration
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            theme: ['./src/config/theme.config.ts']
          }
        }
      },
      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
        extensions: ['.js', '.cjs']
      },
      // CSS optimization
      cssCodeSplit: true,
      // Asset optimization
      assetsInlineLimit: 4096
    },

    // Development server configuration
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      cors: true,
      proxy: {
        '/api': {
          target: apiConfig.baseUrl,
          changeOrigin: true,
          secure: mode === 'production',
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    // Preview server configuration
    preview: {
      port: 3000,
      strictPort: true,
      host: true,
      cors: true
    },

    // Optimization configuration
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['./src/config/theme.config.ts']
    },

    // Resolution configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `$primary-color: ${themeConfig.primaryColor};`
        }
      }
    },

    // TypeScript configuration
    esbuild: {
      jsxInject: `import React from 'react'`
    }
  };
});