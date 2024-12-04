/**
 * Root Component of the Web Application
 * 
 * Requirements Addressed:
 * - Frontend Initialization (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Ensures the application is initialized with the required configurations and renders the root component.
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Applies the theme provider to enable light and dark mode support.
 * - Routing and Navigation (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Implements the routing structure for the web application, ensuring seamless navigation between pages.
 */

// react v18.2.0
import React, { useEffect } from 'react';
// styled-components v5.3.10
import { ThemeProvider } from 'styled-components';

// Internal imports
import AppRoutes from './routes/index';
import useTheme from './hooks/useTheme';
import './styles/global.css';
import { LIGHT_THEME, DARK_THEME } from './config/theme.config';

/**
 * Root component of the web application.
 * Responsible for:
 * - Applying global styles
 * - Setting up theme provider
 * - Integrating routing structure
 * 
 * @returns {JSX.Element} The rendered root component
 */
const App: React.FC = () => {
  // Initialize theme hook
  const { theme, toggleTheme } = useTheme();

  // Set theme on initial load and theme changes
  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.backgroundColor);
    }

    // Add theme-specific class to body
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(
      theme === LIGHT_THEME ? 'light-theme' : 'dark-theme'
    );
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <div className="app" data-testid="app-root">
        <AppRoutes />
      </div>
    </ThemeProvider>
  );
};

export default App;