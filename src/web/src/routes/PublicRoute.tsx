/**
 * Public Route Component
 * 
 * Requirements Addressed:
 * - Public Route Management (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Ensures that public routes are accessible to unauthenticated users and redirects 
 *   authenticated users to their respective dashboards.
 * 
 * Human Tasks:
 * - Verify that redirect paths align with the application's routing configuration
 * - Ensure loading states provide appropriate feedback for screen readers
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // @version 6.14.2
import { ROUTES } from '../constants/routes.constants';
import useAuth from '../hooks/useAuth';
import Loading from '../components/common/Loading/Loading';

/**
 * PublicRoute component that manages access to public routes.
 * Redirects authenticated users to the dashboard and renders child routes
 * for unauthenticated users.
 * 
 * @returns JSX.Element - The rendered public route component
 */
const PublicRoute: React.FC = () => {
  // Get authentication state and status from the auth hook
  const { isAuthenticated, status } = useAuth();

  // Show loading indicator while authentication state is being determined
  if (status === 'loading') {
    return (
      <Loading 
        isLoading={true}
        message="Checking authentication status..."
      />
    );
  }

  // Redirect authenticated users to the dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Render child routes for unauthenticated users
  return <Outlet />;
};

export default PublicRoute;