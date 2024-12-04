/**
 * Login Page Tests
 * 
 * Requirements Addressed:
 * - Authentication UI Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Tests the Login page's user interface, including input fields, buttons, and error messages.
 * - API Interaction Testing (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Ensures the Login page interacts correctly with the authentication API.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure error scenarios are properly tested
 * - Validate accessibility testing requirements
 */

// @testing-library/react v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// @jest/globals v29.0.0
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
// react-router-dom v6.x
import { BrowserRouter } from 'react-router-dom';
// redux imports
import { Provider } from 'react-redux';
import store from '../../store/store';

// Import components and dependencies
import Login from './Login';
import { setupTests } from '../../../tests/setup';
import { initializeMockServer } from '../../../tests/mocks/server';
import { BASE_API_URL } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';

// Initialize test environment
setupTests();
const server = initializeMockServer();

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Test wrapper component
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    // Clear mocks and reset handlers before each test
    jest.clearAllMocks();
    server.resetHandlers();
  });

  describe('UI Elements', () => {
    it('renders all required form elements', () => {
      renderWithProviders(<Login />);

      // Verify header elements
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
      expect(screen.getByText(/enter your credentials/i)).toBeInTheDocument();

      // Verify form inputs
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Verify submit button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Verify additional links
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    });

    it('applies proper disabled states during form submission', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Simulate form submission
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Verify disabled states
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/signing in/i);
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      renderWithProviders(<Login />);

      // Submit empty form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify validation messages
      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    it('validates email format', async () => {
      renderWithProviders(<Login />);

      // Enter invalid email
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      // Verify validation message
      expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    it('validates password requirements', async () => {
      renderWithProviders(<Login />);

      // Enter short password
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.blur(passwordInput);

      // Verify validation message
      expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  describe('API Interactions', () => {
    it('handles successful login', async () => {
      renderWithProviders(<Login />);

      // Mock successful API response
      server.use(
        rest.post(`${BASE_API_URL}/auth/login`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              token: 'mock-token',
              user: {
                id: '1',
                email: 'test@example.com'
              }
            })
          );
        })
      );

      // Submit valid credentials
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' }
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify successful login
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
      });
    });

    it('handles invalid credentials', async () => {
      renderWithProviders(<Login />);

      // Mock API error response
      server.use(
        rest.post(`${BASE_API_URL}/auth/login`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              message: 'Invalid credentials'
            })
          );
        })
      );

      // Submit invalid credentials
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify error message
      expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it('handles network errors', async () => {
      renderWithProviders(<Login />);

      // Mock network error
      server.use(
        rest.post(`${BASE_API_URL}/auth/login`, (req, res) => {
          return res.networkError('Failed to connect');
        })
      );

      // Submit form
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' }
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify error message
      expect(await screen.findByText(/network error occurred/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper focus management', () => {
      renderWithProviders(<Login />);

      // Verify initial focus
      expect(document.activeElement).toBe(screen.getByLabelText(/email address/i));

      // Verify tab order
      fireEvent.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));

      fireEvent.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /sign in/i }));
    });

    it('provides proper ARIA attributes', () => {
      renderWithProviders(<Login />);

      // Verify form accessibility
      expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Login form');

      // Verify input accessibility
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-required', 'true');
    });
  });
});