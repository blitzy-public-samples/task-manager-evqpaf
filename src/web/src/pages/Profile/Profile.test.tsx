/**
 * Unit Tests for Profile Page Component
 * 
 * Requirements Addressed:
 * - User Profile Management (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Tests the Profile page to ensure it allows users to view and update their profile information.
 * - Input Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures that input fields in the Profile page validate user inputs correctly.
 * - Authentication State Management (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Tests the integration of the Profile page with authentication state management.
 */

import React from 'react'; // ^18.2.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react'; // ^13.4.0
import userEvent from '@testing-library/user-event'; // ^13.5.0
import Profile from './Profile';
import useAuth from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation.utils';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');

// Mock the validation utils
jest.mock('../../utils/validation.utils', () => ({
  validateEmail: jest.fn()
}));

describe('Profile Page', () => {
  // Mock user data
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  // Mock auth hook implementation
  const mockUseAuth = useAuth as jest.Mock;
  const mockLogout = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementation
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: mockLogout
    });

    // Setup email validation mock
    (validateEmail as jest.Mock).mockImplementation((email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    });
  });

  it('renders profile page with user information', () => {
    render(<Profile />);

    // Verify page title is rendered
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();

    // Verify input fields are rendered with user data
    expect(screen.getByLabelText(/First Name/i)).toHaveValue(mockUser.firstName);
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue(mockUser.lastName);
    expect(screen.getByLabelText(/Email/i)).toHaveValue(mockUser.email);

    // Verify buttons are rendered
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('handles input validation correctly', async () => {
    render(<Profile />);

    // Get input fields
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const emailInput = screen.getByLabelText(/Email/i);

    // Test empty fields validation
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.change(lastNameInput, { target: { value: '' } });
    fireEvent.change(emailInput, { target: { value: '' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    });

    // Test invalid email validation
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });

    // Test valid inputs
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles form submission correctly', async () => {
    render(<Profile />);

    // Simulate form changes
    const updatedUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    };

    fireEvent.change(screen.getByLabelText(/First Name/i), { 
      target: { value: updatedUser.firstName } 
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { 
      target: { value: updatedUser.lastName } 
    });
    fireEvent.change(screen.getByLabelText(/Email/i), { 
      target: { value: updatedUser.email } 
    });

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /Save Changes/i }));

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles logout functionality', async () => {
    render(<Profile />);

    // Click logout button
    fireEvent.click(screen.getByText(/Logout/i));

    // Verify logout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('handles error states correctly', async () => {
    // Mock useAuth to simulate error state
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(() => {
        throw new Error('Failed to logout')
      })
    });

    render(<Profile />);

    // Click logout button
    fireEvent.click(screen.getByText(/Logout/i));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to logout. Please try again./i)).toBeInTheDocument();
    });
  });

  it('disables form submission while submitting', async () => {
    render(<Profile />);

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /Save Changes/i }));

    // Verify buttons are disabled during submission
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Logout/i })).toBeDisabled();
    });

    // Verify buttons are re-enabled after submission
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /Logout/i })).not.toBeDisabled();
    });
  });
});