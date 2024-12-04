/**
 * Unit tests for the Button component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Button component behaves as expected under different scenarios, maintaining consistency and reliability.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure accessibility testing tools are properly configured
 * - Confirm that all button states are tested according to design specifications
 */

import React from 'react'; // v18.2.0
import { render, screen, fireEvent } from '@testing-library/react'; // v13.4.0
import { Button } from './Button';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import useTheme from '../../../hooks/useTheme';
import { CommonStatus } from '../../../types/common.types';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Button Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: LIGHT_THEME,
      toggleTheme: jest.fn()
    });
  });

  describe('Rendering', () => {
    test('renders with default props', () => {
      render(
        <Button
          label="Test Button"
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toBeDisabled();
    });

    test('renders with custom status', () => {
      render(
        <Button
          label="Status Button"
          status={CommonStatus.PENDING}
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /status button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        backgroundColor: 'transparent'
      });
    });

    test('renders in disabled state', () => {
      render(
        <Button
          label="Disabled Button"
          disabled={true}
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveStyle({
        opacity: '0.6'
      });
    });
  });

  describe('Interaction', () => {
    test('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(
        <Button
          label="Click Me"
          onClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick handler when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button
          label="Disabled"
          disabled={true}
          onClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: /disabled/i });
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Theming', () => {
    test('applies light theme styles', () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: LIGHT_THEME,
        toggleTheme: jest.fn()
      });

      render(
        <Button
          label="Light Theme"
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /light theme/i });
      expect(button).toHaveStyle({
        backgroundColor: LIGHT_THEME.primaryColor
      });
    });

    test('applies dark theme styles', () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: DARK_THEME,
        toggleTheme: jest.fn()
      });

      render(
        <Button
          label="Dark Theme"
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /dark theme/i });
      expect(button).toHaveStyle({
        backgroundColor: DARK_THEME.primaryColor
      });
    });
  });

  describe('Status Styles', () => {
    test('applies active status styles', () => {
      render(
        <Button
          label="Active Button"
          status={CommonStatus.ACTIVE}
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /active button/i });
      expect(button).toHaveStyle({
        backgroundColor: LIGHT_THEME.primaryColor,
        color: '#FFFFFF'
      });
    });

    test('applies inactive status styles', () => {
      render(
        <Button
          label="Inactive Button"
          status={CommonStatus.INACTIVE}
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /inactive button/i });
      expect(button).toHaveStyle({
        backgroundColor: LIGHT_THEME.borderColor,
        color: LIGHT_THEME.textColor
      });
    });

    test('applies pending status styles', () => {
      render(
        <Button
          label="Pending Button"
          status={CommonStatus.PENDING}
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /pending button/i });
      expect(button).toHaveStyle({
        backgroundColor: 'transparent',
        color: LIGHT_THEME.primaryColor
      });
    });
  });

  describe('Accessibility', () => {
    test('has correct ARIA attributes', () => {
      render(
        <Button
          label="Accessible Button"
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /accessible button/i });
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('aria-label', 'Accessible Button');
    });

    test('maintains focus styles', () => {
      render(
        <Button
          label="Focus Button"
          onClick={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /focus button/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });
});