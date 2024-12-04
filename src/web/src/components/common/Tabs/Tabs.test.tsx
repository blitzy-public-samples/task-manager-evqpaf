// @testing-library/react v13.4.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest v29.0.0
import '@testing-library/jest-dom';
import React from 'react';

import Tabs from './Tabs';
import { validateEmail } from '../../../utils/validation.utils';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';

/**
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure accessibility testing tools are properly configured
 * - Confirm test scenarios align with design specifications
 */

describe('Tabs Component', () => {
  // Test data
  const mockTabs = ['Tab 1', 'Tab 2', 'Tab 3'];
  const mockChildren = [
    <div key="1">Content 1</div>,
    <div key="2">Content 2</div>,
    <div key="3">Content 3</div>
  ];

  /**
   * Requirements Addressed:
   * - Testing and Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
   * Tests basic rendering of the Tabs component
   */
  describe('Rendering', () => {
    it('should render all tabs correctly', () => {
      render(
        <Tabs tabs={mockTabs}>
          {mockChildren}
        </Tabs>
      );

      mockTabs.forEach(tab => {
        expect(screen.getByText(tab)).toBeInTheDocument();
      });
    });

    it('should render with light theme', () => {
      render(
        <Tabs tabs={mockTabs} theme={LIGHT_THEME}>
          {mockChildren}
        </Tabs>
      );

      const tabsContainer = screen.getByRole('tablist');
      expect(tabsContainer).toHaveStyle({
        backgroundColor: LIGHT_THEME.backgroundColor
      });
    });

    it('should render with dark theme', () => {
      render(
        <Tabs tabs={mockTabs} theme={DARK_THEME}>
          {mockChildren}
        </Tabs>
      );

      const tabsContainer = screen.getByRole('tablist');
      expect(tabsContainer).toHaveStyle({
        backgroundColor: DARK_THEME.backgroundColor
      });
    });

    it('should apply custom className when provided', () => {
      const customClass = 'custom-tabs';
      render(
        <Tabs tabs={mockTabs} className={customClass}>
          {mockChildren}
        </Tabs>
      );

      const container = screen.getByRole('tablist').parentElement;
      expect(container).toHaveClass(customClass);
    });
  });

  /**
   * Requirements Addressed:
   * - Testing and Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
   * Tests tab interaction and state management
   */
  describe('Interaction', () => {
    it('should show first tab content by default', () => {
      render(
        <Tabs tabs={mockTabs}>
          {mockChildren}
        </Tabs>
      );

      const firstTabPanel = screen.getByRole('tabpanel');
      expect(firstTabPanel).toBeVisible();
      expect(firstTabPanel).toHaveTextContent('Content 1');
    });

    it('should change active tab on click', () => {
      render(
        <Tabs tabs={mockTabs}>
          {mockChildren}
        </Tabs>
      );

      const secondTab = screen.getByText('Tab 2');
      fireEvent.click(secondTab);

      const secondTabPanel = screen.getByRole('tabpanel');
      expect(secondTabPanel).toHaveTextContent('Content 2');
    });

    it('should call onTabChange when tab is clicked', () => {
      const handleTabChange = jest.fn();
      render(
        <Tabs tabs={mockTabs} onTabChange={handleTabChange}>
          {mockChildren}
        </Tabs>
      );

      const secondTab = screen.getByText('Tab 2');
      fireEvent.click(secondTab);

      expect(handleTabChange).toHaveBeenCalledWith(1);
    });

    it('should handle keyboard navigation', () => {
      render(
        <Tabs tabs={mockTabs}>
          {mockChildren}
        </Tabs>
      );

      const secondTab = screen.getByText('Tab 2');
      fireEvent.keyDown(secondTab, { key: 'Enter' });

      const secondTabPanel = screen.getByRole('tabpanel');
      expect(secondTabPanel).toHaveTextContent('Content 2');
    });
  });

  /**
   * Requirements Addressed:
   * - Testing and Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
   * Tests error handling and edge cases
   */
  describe('Error Handling', () => {
    it('should handle empty tabs array', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <Tabs tabs={[]}>
          {mockChildren}
        </Tabs>
      );

      expect(consoleSpy).toHaveBeenCalledWith('Tabs component requires a non-empty array of tab labels');
      consoleSpy.mockRestore();
    });

    it('should handle mismatched children count', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <Tabs tabs={mockTabs}>
          <div>Single Child</div>
        </Tabs>
      );

      expect(consoleSpy).toHaveBeenCalledWith('Number of children must match number of tabs');
      consoleSpy.mockRestore();
    });

    it('should handle invalid tab labels', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const invalidTabs = ['Tab 1', '', 'Tab 3'];
      render(
        <Tabs tabs={invalidTabs}>
          {mockChildren}
        </Tabs>
      );

      expect(consoleSpy).toHaveBeenCalledWith('All tab labels must be non-empty strings');
      consoleSpy.mockRestore();
    });

    it('should validate email in tab labels when used as identifiers', () => {
      const emailTabs = ['user@example.com', 'invalid-email', 'another@email.com'];
      const validEmails = emailTabs.filter(validateEmail);
      
      expect(validEmails.length).toBe(2);
      expect(validateEmail(emailTabs[1])).toBe(false);
    });
  });
});