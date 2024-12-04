/**
 * Unit Tests for Input Component
 * 
 * Requirements Addressed:
 * - Input Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures consistent and reusable validation utilities for user inputs, enhancing data integrity
 *   and user experience.
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides system-default theme detection, manual theme toggle, persistent theme preference,
 *   and high contrast mode.
 */

import React from 'react'; // ^18.2.0
import { render, fireEvent, screen } from '@testing-library/react'; // ^14.0.0
import Input from './Input';
import { validateEmail } from '../../../utils/validation.utils';
import useForm from '../../../hooks/useForm';

// Mock useForm hook
jest.mock('../../../hooks/useForm', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Input Component', () => {
  // Common props for testing
  const defaultProps = {
    type: 'text' as const,
    value: '',
    onChange: jest.fn(),
    placeholder: 'Enter value',
    label: 'Test Input'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders input component with default props', () => {
      render(<Input {...defaultProps} />);
      
      // Verify input element is rendered
      const inputElement = screen.getByPlaceholderText('Enter value');
      expect(inputElement).toBeInTheDocument();
      
      // Verify label is rendered
      const labelElement = screen.getByText('Test Input');
      expect(labelElement).toBeInTheDocument();
    });

    test('renders required indicator when input is required', () => {
      render(<Input {...defaultProps} required={true} />);
      
      // Verify required asterisk is present
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-red-500');
    });

    test('applies disabled styles when input is disabled', () => {
      render(<Input {...defaultProps} disabled={true} />);
      
      const inputElement = screen.getByPlaceholderText('Enter value');
      expect(inputElement).toBeDisabled();
      expect(inputElement).toHaveClass('disabled:bg-gray-100');
      expect(inputElement).toHaveClass('disabled:cursor-not-allowed');
    });

    test('applies different size classes based on size prop', () => {
      const { rerender } = render(<Input {...defaultProps} size="small" />);
      let inputElement = screen.getByPlaceholderText('Enter value');
      expect(inputElement).toHaveClass('px-2', 'py-1', 'text-sm');

      rerender(<Input {...defaultProps} size="large" />);
      inputElement = screen.getByPlaceholderText('Enter value');
      expect(inputElement).toHaveClass('px-4', 'py-3', 'text-lg');
    });
  });

  describe('Validation', () => {
    test('validates email input correctly', () => {
      const emailProps = {
        ...defaultProps,
        type: 'email' as const,
        value: 'invalid-email',
        errorMessage: 'Please enter a valid email'
      };

      render(<Input {...emailProps} />);
      const inputElement = screen.getByPlaceholderText('Enter value');

      // Trigger validation by focusing and blurring
      fireEvent.focus(inputElement);
      fireEvent.blur(inputElement);

      // Verify error message is displayed
      const errorMessage = screen.getByText('Please enter a valid email');
      expect(errorMessage).toBeInTheDocument();
      expect(inputElement).toHaveClass('border-red-500');
    });

    test('shows no error for valid email input', () => {
      const emailProps = {
        ...defaultProps,
        type: 'email' as const,
        value: 'test@example.com'
      };

      render(<Input {...emailProps} />);
      const inputElement = screen.getByPlaceholderText('Enter value');

      // Trigger validation
      fireEvent.focus(inputElement);
      fireEvent.blur(inputElement);

      // Verify no error message is displayed
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).not.toBeInTheDocument();
      expect(inputElement).not.toHaveClass('border-red-500');
    });

    test('handles custom validation function', () => {
      const customValidate = (value: string) => value.length >= 5;
      const customProps = {
        ...defaultProps,
        validate: customValidate,
        errorMessage: 'Minimum 5 characters required'
      };

      render(<Input {...customProps} />);
      const inputElement = screen.getByPlaceholderText('Enter value');

      // Test invalid input
      fireEvent.change(inputElement, { target: { value: 'test' } });
      fireEvent.blur(inputElement);

      let errorMessage = screen.getByText('Minimum 5 characters required');
      expect(errorMessage).toBeInTheDocument();

      // Test valid input
      fireEvent.change(inputElement, { target: { value: 'testing' } });
      fireEvent.blur(inputElement);

      errorMessage = screen.queryByText('Minimum 5 characters required');
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    test('applies theme styles correctly', () => {
      render(<Input {...defaultProps} />);
      const inputElement = screen.getByPlaceholderText('Enter value');

      // Verify base theme classes are applied
      expect(inputElement).toHaveClass(
        'block',
        'w-full',
        'rounded-md',
        'shadow-sm',
        'transition-colors',
        'duration-200'
      );
    });

    test('applies error theme styles when validation fails', () => {
      const props = {
        ...defaultProps,
        value: 'invalid',
        validate: () => false,
        errorMessage: 'Invalid input'
      };

      render(<Input {...props} />);
      const inputElement = screen.getByPlaceholderText('Enter value');

      // Trigger validation
      fireEvent.focus(inputElement);
      fireEvent.blur(inputElement);

      // Verify error theme classes are applied
      expect(inputElement).toHaveClass('border-red-500');
      expect(inputElement).toHaveClass('focus:border-red-500');
      expect(inputElement).toHaveClass('focus:ring-red-500');
    });
  });

  describe('Interaction Handling', () => {
    test('calls onChange handler when input value changes', () => {
      const handleChange = jest.fn();
      render(<Input {...defaultProps} onChange={handleChange} />);
      
      const inputElement = screen.getByPlaceholderText('Enter value');
      fireEvent.change(inputElement, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalledWith('new value');
    });

    test('handles focus and blur events correctly', () => {
      render(<Input {...defaultProps} />);
      const inputElement = screen.getByPlaceholderText('Enter value');

      // Test focus
      fireEvent.focus(inputElement);
      expect(inputElement).toHaveFocus();

      // Test blur
      fireEvent.blur(inputElement);
      expect(inputElement).not.toHaveFocus();
    });
  });
});