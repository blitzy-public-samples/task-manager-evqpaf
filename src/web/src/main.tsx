/**
 * Main Entry Point for React Application
 * 
 * Requirements Addressed:
 * - Frontend Initialization (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Ensures the application is initialized with the required configurations and renders the root component.
 * - State Management (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Integrates the Redux store to manage application-wide state.
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Applies the theme provider to enable light and dark mode support.
 * 
 * Human Tasks:
 * - Verify React root element exists in index.html
 * - Ensure Redux DevTools are properly configured for production
 * - Test theme persistence across page reloads
 */

// react v18.2.0
import React from 'react';
// react-dom v18.2.0
import ReactDOM from 'react-dom/client';
// react-redux v8.1.2
import { Provider } from 'react-redux';

// Internal imports
import App from './App';
import store from './store/store';
import './styles/global.css';
import { applyTheme } from './styles/theme';
import { getTheme } from './config/theme.config';

/**
 * Main function that initializes and renders the React application.
 * Configures the Redux store, theme provider, and renders the root component.
 */
const main = (): void => {
  try {
    // Get the root element
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found. Ensure index.html contains an element with id "root"');
    }

    // Initialize theme
    const initialTheme = getTheme();
    applyTheme(initialTheme);

    // Create React root and render application
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </React.StrictMode>
    );

    // Log successful initialization
    console.log('Application initialized successfully');
  } catch (error) {
    // Log initialization errors
    console.error('Failed to initialize application:', error);
    
    // Display error message to user
    const errorElement = document.createElement('div');
    errorElement.style.padding = '20px';
    errorElement.style.color = 'red';
    errorElement.textContent = 'Failed to initialize application. Please refresh the page or contact support.';
    document.body.appendChild(errorElement);
  }
};

// Initialize the application
main();

export default main;