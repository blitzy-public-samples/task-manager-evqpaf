/**
 * Unit Tests for Sidebar Component
 * 
 * Requirements Addressed:
 * - Navigation and Theme Management (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Ensures the Sidebar component provides navigation and theme management functionality as per the design specifications.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user flows are properly tested
 * - Add additional test cases for edge cases if needed
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// react-redux v8.0.5
import { Provider } from 'react-redux';

// Internal imports
import Sidebar from './Sidebar';
import { ROUTES } from '../../../constants/routes.constants';
import useAuth from '../../../hooks/useAuth';
import store from '../../../store/store';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth');

// Mock the react-router-dom Link component
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="mock-link">
      {children}
    </a>
  ),
}));

describe('Sidebar Component', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Navigation Links', () => {
    it('should render all navigation links when user is authenticated', () => {
      // Mock authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' }
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Verify all navigation links are present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();

      // Verify correct routes are used
      const links = screen.getAllByTestId('mock-link');
      expect(links[0]).toHaveAttribute('href', ROUTES.DASHBOARD);
      expect(links[1]).toHaveAttribute('href', ROUTES.PROJECTS);
      expect(links[2]).toHaveAttribute('href', ROUTES.TASKS);
      expect(links[3]).toHaveAttribute('href', ROUTES.PROFILE);
    });

    it('should not render navigation links when user is not authenticated', () => {
      // Mock unauthenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Verify navigation links are not present
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Projects')).not.toBeInTheDocument();
      expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      // Mock authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' }
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Verify theme toggle button is present
      const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('should toggle theme when clicked', () => {
      // Mock authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' }
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Get theme toggle button
      const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });

      // Click theme toggle button
      fireEvent.click(themeToggle);

      // Verify theme toggle button text changes
      expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument();

      // Click again to toggle back
      fireEvent.click(themeToggle);

      // Verify theme toggle button text changes back
      expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
    });
  });

  describe('User-specific Options', () => {
    it('should render logout button when user is authenticated', () => {
      // Mock authenticated user with logout function
      const mockLogout = jest.fn();
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: mockLogout
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Verify logout button is present
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();

      // Click logout button
      fireEvent.click(logoutButton);

      // Verify logout function was called
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should not render logout button when user is not authenticated', () => {
      // Mock unauthenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Verify logout button is not present
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // Mock authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' }
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Verify ARIA labels and roles
      expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Main Navigation');
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch to dark theme/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /logout/i })).toHaveAttribute('aria-label', 'Logout');
    });
  });
});