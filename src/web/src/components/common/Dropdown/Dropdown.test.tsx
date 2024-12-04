/**
 * Unit tests for the Dropdown component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Dropdown component behaves correctly under various scenarios, including theming and validation.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all edge cases are properly tested
 * - Add additional test cases for specific business requirements
 */

// @testing-library/react v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// react v18.2.0
import React from 'react';
// jest v29.0.0
import '@testing-library/jest-dom';

import Dropdown from './Dropdown';
import { validateEmail } from '../../../utils/validation.utils';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import { CommonStatus } from '../../../types/common.types';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  __esModule: true,
  default: () => ({
    theme: LIGHT_THEME,
    toggleTheme: jest.fn()
  })
}));

describe('Dropdown Component', () => {
  // Test data
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true }
  ];

  const defaultProps = {
    options: mockOptions,
    value: '',
    onChange: jest.fn(),
    testId: 'test-dropdown'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders dropdown with default props', () => {
      render(<Dropdown {...defaultProps} />);
      
      const dropdown = screen.getByTestId('test-dropdown');
      expect(dropdown).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    test('renders dropdown with custom placeholder', () => {
      render(<Dropdown {...defaultProps} placeholder="Custom placeholder" />);
      expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
    });

    test('renders dropdown with selected value', () => {
      render(<Dropdown {...defaultProps} value="option1" />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    test('renders required indicator when required prop is true', () => {
      render(<Dropdown {...defaultProps} required={true} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('renders error message when error prop is provided', () => {
      const errorMessage = 'This field is required';
      render(<Dropdown {...defaultProps} error={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Theming', () => {
    test('applies light theme styles correctly', () => {
      render(<Dropdown {...defaultProps} />);
      const dropdown = screen.getByTestId('test-dropdown');
      
      expect(dropdown).toHaveStyle({
        color: LIGHT_THEME.textColor
      });
    });

    test('applies dark theme styles correctly', () => {
      // Mock useTheme to return dark theme
      jest.spyOn(require('../../../hooks/useTheme'), 'default').mockImplementation(() => ({
        theme: DARK_THEME,
        toggleTheme: jest.fn()
      }));

      render(<Dropdown {...defaultProps} />);
      const dropdown = screen.getByTestId('test-dropdown');
      
      expect(dropdown).toHaveStyle({
        color: DARK_THEME.textColor
      });
    });

    test('applies disabled styles correctly', () => {
      render(<Dropdown {...defaultProps} disabled={true} />);
      const combobox = screen.getByRole('combobox');
      
      expect(combobox).toHaveStyle({
        cursor: 'not-allowed',
        opacity: '0.6'
      });
    });

    test('applies inactive status styles correctly', () => {
      render(<Dropdown {...defaultProps} status={CommonStatus.INACTIVE} />);
      const combobox = screen.getByRole('combobox');
      
      expect(combobox).toHaveStyle({
        opacity: '0.6'
      });
    });
  });

  describe('Interaction', () => {
    test('opens options list on click', () => {
      render(<Dropdown {...defaultProps} />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.click(combobox);
      const optionsList = screen.getByRole('listbox');
      expect(optionsList).toBeVisible();
    });

    test('closes options list when clicking outside', () => {
      render(
        <div>
          <Dropdown {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      );
      
      const combobox = screen.getByRole('combobox');
      fireEvent.click(combobox);
      
      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);
      
      const optionsList = screen.getByRole('listbox');
      expect(optionsList).not.toBeVisible();
    });

    test('selects option on click', () => {
      render(<Dropdown {...defaultProps} />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.click(combobox);
      fireEvent.click(screen.getByText('Option 1'));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('option1');
    });

    test('does not select disabled option', () => {
      render(<Dropdown {...defaultProps} />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.click(combobox);
      fireEvent.click(screen.getByText('Option 3'));
      
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    test('opens dropdown with Enter key', () => {
      render(<Dropdown {...defaultProps} />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.keyDown(combobox, { key: 'Enter' });
      const optionsList = screen.getByRole('listbox');
      expect(optionsList).toBeVisible();
    });

    test('closes dropdown with Escape key', () => {
      render(<Dropdown {...defaultProps} />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.keyDown(combobox, { key: 'Enter' });
      fireEvent.keyDown(combobox, { key: 'Escape' });
      
      const optionsList = screen.getByRole('listbox');
      expect(optionsList).not.toBeVisible();
    });

    test('navigates options with arrow keys', () => {
      render(<Dropdown {...defaultProps} value="option1" />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.keyDown(combobox, { key: 'ArrowDown' });
      expect(defaultProps.onChange).toHaveBeenCalledWith('option2');
      
      fireEvent.keyDown(combobox, { key: 'ArrowUp' });
      expect(defaultProps.onChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('Validation', () => {
    test('validates email when validateAsEmail is true', async () => {
      render(<Dropdown {...defaultProps} validateAsEmail={true} />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.click(combobox);
      fireEvent.click(screen.getByText('Option 1'));
      
      // Option1 is not a valid email, so onChange should not be called
      expect(defaultProps.onChange).not.toHaveBeenCalled();
      
      // Mock a valid email option
      const emailOptions = [
        { value: 'test@example.com', label: 'Valid Email' }
      ];
      
      render(<Dropdown {...defaultProps} options={emailOptions} validateAsEmail={true} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Valid Email'));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('test@example.com');
    });

    test('handles empty options array', () => {
      render(<Dropdown {...defaultProps} options={[]} />);
      const combobox = screen.getByRole('combobox');
      
      fireEvent.click(combobox);
      const optionsList = screen.getByRole('listbox');
      
      expect(optionsList).toBeEmpty();
    });
  });
});