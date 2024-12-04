/**
 * Sidebar Component
 * 
 * Requirements Addressed:
 * - Navigation and Theme Management (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Provides a sidebar for navigation and theme management, ensuring seamless user experience and accessibility.
 * 
 * Human Tasks:
 * - Verify that navigation links match the configured routes
 * - Ensure theme toggle button is accessible via keyboard navigation
 * - Test sidebar responsiveness on different screen sizes
 */

// react v18.2.0
import React from 'react';
// react-router-dom v6.14.1
import { Link } from 'react-router-dom';

// Internal imports
import useAuth from '../../../hooks/useAuth';
import useTheme from '../../../hooks/useTheme';
import { ROUTES } from '../../../constants/routes.constants';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import { setItem } from '../../../utils/storage.utils';

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle theme toggle and persist preference
  const handleThemeToggle = () => {
    toggleTheme();
    setItem('app_theme', theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME);
  };

  return (
    <aside className="sidebar" role="complementary" aria-label="Main Navigation">
      <nav className="sidebar-nav" role="navigation">
        <ul className="nav-list">
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link 
                  to={ROUTES.DASHBOARD}
                  className="nav-link"
                  aria-label="Dashboard"
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Dashboard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to={ROUTES.PROJECTS}
                  className="nav-link"
                  aria-label="Projects"
                >
                  <span className="nav-icon">📁</span>
                  <span className="nav-text">Projects</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to={ROUTES.TASKS}
                  className="nav-link"
                  aria-label="Tasks"
                >
                  <span className="nav-icon">✓</span>
                  <span className="nav-text">Tasks</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to={ROUTES.PROFILE}
                  className="nav-link"
                  aria-label="Profile"
                >
                  <span className="nav-icon">👤</span>
                  <span className="nav-text">Profile</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          className="theme-toggle"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${theme === LIGHT_THEME ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === LIGHT_THEME ? 'dark' : 'light'} theme`}
        >
          <span className="theme-icon">
            {theme === LIGHT_THEME ? '🌙' : '☀️'}
          </span>
          <span className="theme-text">
            {theme === LIGHT_THEME ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>

        {isAuthenticated && (
          <button
            className="logout-button"
            onClick={logout}
            aria-label="Logout"
            title="Logout"
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          width: 250px;
          height: 100vh;
          background-color: var(--background-color);
          border-right: 1px solid var(--border-color);
          padding: 1rem;
          transition: var(--theme-transition);
        }

        .sidebar-nav {
          flex: 1;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item {
          margin-bottom: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: var(--text-color);
          text-decoration: none;
          border-radius: 0.5rem;
          transition: var(--theme-transition);
        }

        .nav-link:hover {
          background-color: var(--primary-color);
          color: var(--background-color);
        }

        .nav-icon {
          margin-right: 0.75rem;
          font-size: 1.25rem;
        }

        .nav-text {
          font-size: 1rem;
        }

        .sidebar-footer {
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .theme-toggle,
        .logout-button {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-color);
          cursor: pointer;
          transition: var(--theme-transition);
        }

        .theme-toggle:hover,
        .logout-button:hover {
          background-color: var(--primary-color);
          color: var(--background-color);
        }

        .theme-icon,
        .logout-icon {
          margin-right: 0.75rem;
          font-size: 1.25rem;
        }

        .theme-text,
        .logout-text {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
          }

          .nav-text,
          .theme-text,
          .logout-text {
            display: none;
          }

          .nav-icon,
          .theme-icon,
          .logout-icon {
            margin-right: 0;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;