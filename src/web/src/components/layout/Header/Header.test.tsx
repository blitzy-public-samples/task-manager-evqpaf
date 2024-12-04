/**
 * Unit tests for the Header component
 * 
 * Requirements Addressed:
 * - Component Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Header component functions correctly, including navigation, authentication, and theme toggling.
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest v29.0.0
import { jest } from '@jest/globals';

// Component imports
import Header from './Header';
import useAuth from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants/routes.constants';
import { applyTheme } from '../../../styles/theme';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => jest.fn()
}));

// Mock useAuth hook
jest.mock('../../../hooks/useAuth');

// Mock useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  __esModule: true,
  default: () => ({
    theme: { backgroundColor: '#FFFFFF' },
    toggleTheme: jest.fn()
  })
}));

// Mock applyTheme function
jest.mock('../../../styles/theme', () => ({
  applyTheme: jest.fn()
}));

describe('Header Component', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testHeaderRendering', () => {
    it('should render header with all elements when authenticated', () => {
      // Mock authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        user: { email: 'test@example.com' },
        isAuthenticated: true,
        logout: jest.fn()
      });

      render(<Header />);

      // Verify navigation links are present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();

      // Verify theme toggle button is present
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();

      // Verify user dropdown is present
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should render header with limited elements when not authenticated', () => {
      // Mock unauthenticated state
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn()
      });

      render(<Header />);

      // Verify only public navigation links are present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();

      // Verify theme toggle is still present
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();

      // Verify login button is present instead of user dropdown
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('testThemeToggle', () => {
    it('should call theme toggle function when theme button is clicked', () => {
      // Mock theme toggle function
      const mockToggleTheme = jest.fn();
      jest.spyOn(require('../../../hooks/useTheme'), 'default').mockImplementation(() => ({
        theme: { backgroundColor: '#FFFFFF' },
        toggleTheme: mockToggleTheme
      }));

      // Mock auth state
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        login: jest.fn()
      });

      render(<Header />);

      // Find and click theme toggle button
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeButton);

      // Verify theme toggle was called
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('testAuthenticationControls', () => {
    it('should show login button when user is not authenticated', () => {
      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

      // Mock unauthenticated state
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn()
      });

      render(<Header />);

      // Find and click login button
      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      // Verify navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });

    it('should show user dropdown with logout option when authenticated', () => {
      const mockLogout = jest.fn();
      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

      // Mock authenticated state
      (useAuth as jest.Mock).mockReturnValue({
        user: { email: 'test@example.com' },
        isAuthenticated: true,
        logout: mockLogout
      });

      render(<Header />);

      // Find and click user dropdown
      const userDropdown = screen.getByText('test@example.com');
      fireEvent.click(userDropdown);

      // Find and click logout option
      const logoutOption = screen.getByText('Logout');
      fireEvent.click(logoutOption);

      // Verify logout was called and navigation occurred
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });
});