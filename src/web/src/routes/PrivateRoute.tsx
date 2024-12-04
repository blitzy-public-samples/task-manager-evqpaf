/**
 * PrivateRoute Component
 * 
 * Requirements Addressed:
 * - Authentication and Authorization (Technical Specification/6.1 Authentication and Authorization/6.1.2 Authorization Matrix)
 *   Ensures that only authenticated users can access protected routes, redirecting unauthenticated users to the login page.
 * 
 * Human Tasks:
 * - Verify that the login redirect URL matches the configured authentication flow
 * - Ensure proper handling of deep-linked URLs after authentication
 * - Test redirect behavior with various authentication states
 */

// react v18.2.0
import React from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';
// react-router-dom v6.14.2
import { Navigate } from 'react-router-dom';

// Internal imports
import { ROUTES } from '../constants/routes.constants';
import useAuth from '../hooks/useAuth';
import Loading from '../components/common/Loading/Loading';
import Notification from '../components/common/Notification/Notification';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that protects routes by checking authentication status.
 * Redirects unauthenticated users to the login page and shows loading state
 * while checking authentication.
 * 
 * @param children - The child components to render when authenticated
 * @returns The protected route content or redirect to login
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, status, error } = useAuth();

  // Show loading indicator while checking authentication status
  if (status === 'loading') {
    return <Loading isLoading={true} message="Verifying authentication..." />;
  }

  // Show error notification if authentication check fails
  if (error) {
    return (
      <Notification
        type="error"
        message="Authentication error occurred. Please try again."
        duration={5000}
      />
    );
  }

  // Redirect to login page if user is not authenticated
  if (!isAuthenticated) {
    // Store the current path to redirect back after login
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams();
    if (currentPath !== '/') {
      searchParams.set('redirect', currentPath);
    }

    const loginPath = `${ROUTES.LOGIN}${
      searchParams.toString() ? `?${searchParams.toString()}` : ''
    }`;

    return <Navigate to={loginPath} replace />;
  }

  // Render the protected route content if authenticated
  return <>{children}</>;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;