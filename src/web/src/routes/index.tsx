/**
 * Main Routing Structure
 * 
 * Requirements Addressed:
 * - Routing and Navigation (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Implements the routing structure for the web application, ensuring seamless navigation between pages.
 * - Access Control (Technical Specification/6.1 Authentication and Authorization/6.1.2 Authorization Matrix)
 *   Ensures that routes are protected based on user authentication and role-based access control.
 * 
 * Human Tasks:
 * - Verify that all route paths match the configured backend routes
 * - Ensure proper handling of deep-linked URLs after authentication
 * - Test route protection with various authentication states
 */

// react v18.2.0
import React from 'react';
// react-router-dom v6.14.2
import { Routes, Route } from 'react-router-dom';

// Import route components
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Import page components
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProjectsPage from '../pages/Projects/Projects';
import Tasks from '../pages/Tasks/Tasks';
import NotFound from '../pages/NotFound/NotFound';
import Profile from '../pages/Profile/Profile';
import ProjectDetails from '../pages/ProjectDetails/ProjectDetails';
import TaskDetails from '../pages/TaskDetails/TaskDetails';

/**
 * AppRoutes component that defines the main routing structure for the application.
 * Handles both public and private routes with appropriate access control.
 * 
 * @returns JSX.Element The rendered routing structure
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />

        {/* Tasks */}
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:taskId" element={<TaskDetails />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 404 Not Found - Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;