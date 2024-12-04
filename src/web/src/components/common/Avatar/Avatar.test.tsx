/**
 * Avatar Component Tests
 * 
 * Requirements Addressed:
 * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Avatar component behaves as expected under different scenarios, including rendering,
 *   fallback handling, and conditional styling.
 * 
 * Human Tasks:
 * - Verify that test coverage meets project requirements
 * - Ensure all edge cases are properly tested
 * - Confirm that theme-related tests align with design specifications
 */

// @testing-library/react version 13.4.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest version 29.0.0
import '@testing-library/jest-dom';
import React from 'react';

// Internal imports
import { Avatar } from './Avatar';
import { capitalize } from '../../../utils/string.utils';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import useAuth from '../../../hooks/useAuth';
import { CommonStatus } from '../../../types/common.types';
import { images } from '../../../assets/images';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the theme application function
jest.mock('../../../styles/theme', () => ({
  applyTheme: jest.fn()
}));

describe('Avatar Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      status: 'idle',
      error: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      getAuthToken: jest.fn(),
      getRefreshToken: jest.fn()
    });
  });

  describe('Avatar Rendering', () => {
    test('renders correctly with valid image source', () => {
      const testSrc = 'https://example.com/avatar.jpg';
      const testAlt = 'Test User';

      render(<Avatar src={testSrc} alt={testAlt} />);
      
      const avatarImage = screen.getByRole('img');
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', testSrc);
      expect(avatarImage).toHaveAttribute('alt', testAlt);
    });

    test('renders with custom size', () => {
      const testSize = '60px';
      render(<Avatar alt="Test User" size={testSize} />);
      
      const avatarContainer = screen.getByTestId('avatar-container');
      expect(avatarContainer).toHaveStyle({ width: testSize, height: testSize });
    });

    test('renders initials when no image source is provided', () => {
      const testName = 'John Doe';
      const expectedInitials = 'JD';
      
      render(<Avatar alt={testName} />);
      
      const initials = screen.getByText(expectedInitials);
      expect(initials).toBeInTheDocument();
    });
  });

  describe('Fallback Image Handling', () => {
    test('uses fallback image when src is not provided', () => {
      render(<Avatar alt="Test User" />);
      
      const fallbackImage = screen.queryByRole('img');
      expect(fallbackImage).toHaveAttribute('src', images.placeholders.user);
      expect(fallbackImage).toHaveAttribute('alt', 'Default avatar');
    });

    test('switches to fallback on image load error', () => {
      render(<Avatar src="invalid-image.jpg" alt="Test User" />);
      
      const avatarImage = screen.getByRole('img');
      fireEvent.error(avatarImage);
      
      expect(avatarImage).toHaveAttribute('src', images.placeholders.user);
      expect(avatarImage).toHaveAttribute('alt', 'Default avatar');
    });

    test('generates correct initials for single name', () => {
      render(<Avatar alt="John" />);
      
      const initials = screen.getByText('J');
      expect(initials).toBeInTheDocument();
    });
  });

  describe('Conditional Styling', () => {
    test('applies correct status indicator styles', () => {
      render(
        <Avatar 
          alt="Test User" 
          status={CommonStatus.ACTIVE}
        />
      );
      
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveStyle({ backgroundColor: '#4CAF50' });
    });

    test('handles inactive status correctly', () => {
      render(
        <Avatar 
          alt="Test User" 
          status={CommonStatus.INACTIVE}
        />
      );
      
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveStyle({ backgroundColor: '#9E9E9E' });
    });

    test('handles pending status correctly', () => {
      render(
        <Avatar 
          alt="Test User" 
          status={CommonStatus.PENDING}
        />
      );
      
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveStyle({ backgroundColor: '#FFC107' });
    });
  });

  describe('Theme Support', () => {
    test('applies light theme styles correctly', () => {
      render(<Avatar alt="Test User" />);
      
      const avatarContainer = screen.getByTestId('avatar-container');
      expect(avatarContainer).toHaveStyle({
        backgroundColor: LIGHT_THEME.backgroundColor,
        borderColor: LIGHT_THEME.borderColor
      });
    });

    test('applies dark theme styles correctly', () => {
      render(<Avatar alt="Test User" />);
      
      const avatarContainer = screen.getByTestId('avatar-container');
      expect(avatarContainer).toHaveStyle({
        backgroundColor: DARK_THEME.backgroundColor,
        borderColor: DARK_THEME.borderColor
      });
    });
  });

  describe('String Utility Integration', () => {
    test('correctly capitalizes initials', () => {
      const name = 'john doe';
      const expectedInitials = capitalize('JD');
      
      render(<Avatar alt={name} />);
      
      const initials = screen.getByText(expectedInitials);
      expect(initials).toBeInTheDocument();
    });
  });
});