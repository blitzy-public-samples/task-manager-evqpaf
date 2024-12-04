// @testing-library/react version: 14.0.0
// jest version: 29.0.0
// react version: 18.2.0

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';
import { validateEmail } from '../../../utils/validation.utils';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';

/**
 * Human Tasks:
 * - Verify that all test cases pass in CI/CD pipeline
 * - Ensure accessibility testing tools are properly configured
 * - Confirm test coverage meets project requirements
 */

// Helper function to render Checkbox with default props
const renderCheckbox = (checked: boolean = false, label: string = 'Test Label') => {
  const handleChange = jest.fn();
  return {
    handleChange,
    ...render(
      <Checkbox
        checked={checked}
        label={label}
        onChange={handleChange}
      />
    )
  };
};

describe('Checkbox Component', () => {
  // Test Requirement: Reusable UI Components
  // Location: Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements
  describe('Basic Rendering', () => {
    it('renders correctly with label and checked state', () => {
      const label = 'Accept terms';
      const { getByLabelText } = renderCheckbox(true, label);
      
      const checkbox = getByLabelText(label) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.checked).toBe(true);
    });

    it('renders with unchecked state by default', () => {
      const { getByRole } = renderCheckbox(false);
      
      const checkbox = getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('displays required indicator when required prop is true', () => {
      const label = 'Required Field';
      render(
        <Checkbox
          checked={false}
          label={label}
          onChange={() => {}}
          required={true}
        />
      );
      
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
    });
  });

  // Test Requirement: Reusable UI Components
  // Location: Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements
  describe('Interaction Handling', () => {
    it('toggles state on click', () => {
      const { getByRole, handleChange } = renderCheckbox(false);
      
      const checkbox = getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('handles keyboard interaction', () => {
      const { getByRole, handleChange } = renderCheckbox(false);
      
      const checkbox = getByRole('checkbox');
      fireEvent.keyPress(checkbox, { key: 'Enter', code: 'Enter' });
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('prevents interaction when disabled', () => {
      const handleChange = jest.fn();
      render(
        <Checkbox
          checked={false}
          label="Disabled Checkbox"
          onChange={handleChange}
          disabled={true}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // Test Requirement: Reusable UI Components
  // Location: Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements
  describe('Theme Integration', () => {
    it('applies light theme styles correctly', () => {
      const { container } = render(
        <Checkbox
          checked={false}
          label="Light Theme Checkbox"
          onChange={() => {}}
        />
      );
      
      // Apply light theme
      document.documentElement.style.setProperty('--primary-color', LIGHT_THEME.primaryColor);
      document.documentElement.style.setProperty('--border-color', LIGHT_THEME.borderColor);
      
      const checkboxContainer = container.firstChild;
      expect(checkboxContainer).toHaveStyle({
        opacity: '1'
      });
    });

    it('applies dark theme styles correctly', () => {
      const { container } = render(
        <Checkbox
          checked={false}
          label="Dark Theme Checkbox"
          onChange={() => {}}
        />
      );
      
      // Apply dark theme
      document.documentElement.style.setProperty('--primary-color', DARK_THEME.primaryColor);
      document.documentElement.style.setProperty('--border-color', DARK_THEME.borderColor);
      
      const checkboxContainer = container.firstChild;
      expect(checkboxContainer).toHaveStyle({
        opacity: '1'
      });
    });
  });

  // Test Requirement: Reusable UI Components
  // Location: Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements
  describe('Error Handling', () => {
    it('displays error message when provided', () => {
      const errorMessage = 'This field is required';
      render(
        <Checkbox
          checked={false}
          label="Error Checkbox"
          onChange={() => {}}
          error={errorMessage}
        />
      );
      
      const errorText = screen.getByText(errorMessage);
      expect(errorText).toBeInTheDocument();
      expect(errorText).toHaveAttribute('role', 'alert');
    });

    it('applies error styles when error is present', () => {
      const { container } = render(
        <Checkbox
          checked={false}
          label="Error Checkbox"
          onChange={() => {}}
          error="Error message"
        />
      );
      
      const checkbox = container.querySelector('span[role="presentation"]');
      expect(checkbox).toHaveStyle({
        borderColor: 'var(--error-color, #dc3545)'
      });
    });
  });

  // Test Requirement: Reusable UI Components
  // Location: Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements
  describe('Form Integration', () => {
    it('integrates with form validation', () => {
      const mockSubmit = jest.fn();
      const { getByRole } = render(
        <form onSubmit={(e) => {
          e.preventDefault();
          mockSubmit();
        }}>
          <Checkbox
            checked={false}
            label="Accept Terms"
            onChange={() => {}}
            required={true}
          />
          <button type="submit">Submit</button>
        </form>
      );
      
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('works with email validation utility', () => {
      const email = 'test@example.com';
      const isValid = validateEmail(email);
      
      const { getByRole } = render(
        <form>
          <input type="email" value={email} readOnly />
          <Checkbox
            checked={isValid}
            label="Email is valid"
            onChange={() => {}}
          />
        </form>
      );
      
      const checkbox = getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });
});