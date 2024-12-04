/**
 * Unit tests for the DatePicker component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the DatePicker component is tested for consistent and accessible date selection functionality.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure date format patterns match localization requirements
 * - Test with different browser locales to verify date formatting
 */

// @testing-library/react v14.0.0
import { render, fireEvent, screen } from '@testing-library/react';
// jest v29.0.0
import { jest } from '@jest/globals';

// Internal imports
import DatePickerComponent from './DatePicker';
import { formatDate } from '../../../utils/date.utils';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import useTheme from '../../../hooks/useTheme';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme');

describe('DatePicker Component', () => {
  // Common test props
  const defaultProps = {
    selectedDate: null,
    onChange: jest.fn(),
    placeholder: 'Select date'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Default to light theme
    (useTheme as jest.Mock).mockReturnValue({ theme: LIGHT_THEME });
  });

  describe('rendersDatePicker', () => {
    it('renders with default props', () => {
      render(<DatePickerComponent {...defaultProps} />);
      
      // Verify input field is present with correct placeholder
      const datePicker = screen.getByPlaceholderText('Select date');
      expect(datePicker).toBeInTheDocument();
      expect(datePicker).toHaveAttribute('class', expect.stringContaining('datepicker-input'));
    });

    it('renders with a selected date', () => {
      const selectedDate = new Date('2023-12-25');
      render(
        <DatePickerComponent
          {...defaultProps}
          selectedDate={selectedDate}
        />
      );

      // Verify the formatted date is displayed
      const datePicker = screen.getByDisplayValue(formatDate(selectedDate, 'MEDIUM'));
      expect(datePicker).toBeInTheDocument();
    });

    it('renders in disabled state', () => {
      render(
        <DatePickerComponent
          {...defaultProps}
          disabled={true}
        />
      );

      const datePicker = screen.getByPlaceholderText('Select date');
      expect(datePicker).toBeDisabled();
      expect(datePicker).toHaveAttribute('class', expect.stringContaining('datepicker-input--disabled'));
    });
  });

  describe('handlesDateSelection', () => {
    it('calls onChange when a date is selected', () => {
      const onChange = jest.fn();
      render(
        <DatePickerComponent
          {...defaultProps}
          onChange={onChange}
        />
      );

      // Simulate date selection
      const datePicker = screen.getByPlaceholderText('Select date');
      fireEvent.click(datePicker);
      
      // Select a date from the calendar
      const dateToSelect = screen.getByText('15');
      fireEvent.click(dateToSelect);

      // Verify onChange was called with the selected date
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it('handles date clearing', () => {
      const onChange = jest.fn();
      const selectedDate = new Date('2023-12-25');
      render(
        <DatePickerComponent
          {...defaultProps}
          selectedDate={selectedDate}
          onChange={onChange}
        />
      );

      // Find and click the clear button
      const clearButton = screen.getByLabelText('Clear date');
      fireEvent.click(clearButton);

      // Verify onChange was called with null
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('respects min and max date constraints', () => {
      const minDate = new Date('2023-01-01');
      const maxDate = new Date('2023-12-31');
      render(
        <DatePickerComponent
          {...defaultProps}
          minDate={minDate}
          maxDate={maxDate}
        />
      );

      // Open the date picker
      const datePicker = screen.getByPlaceholderText('Select date');
      fireEvent.click(datePicker);

      // Verify dates outside range are disabled
      const disabledDates = screen.getAllByRole('button', { disabled: true });
      expect(disabledDates.length).toBeGreaterThan(0);
    });
  });

  describe('appliesThemeCorrectly', () => {
    it('applies light theme styles', () => {
      (useTheme as jest.Mock).mockReturnValue({ theme: LIGHT_THEME });
      render(<DatePickerComponent {...defaultProps} />);

      const datePicker = screen.getByPlaceholderText('Select date');
      expect(datePicker).toHaveAttribute('class', expect.not.stringContaining('datepicker-input--dark'));
    });

    it('applies dark theme styles', () => {
      (useTheme as jest.Mock).mockReturnValue({ theme: DARK_THEME });
      render(<DatePickerComponent {...defaultProps} />);

      const datePicker = screen.getByPlaceholderText('Select date');
      expect(datePicker).toHaveAttribute('class', expect.stringContaining('datepicker-input--dark'));
    });

    it('updates styles when theme changes', () => {
      const { rerender } = render(<DatePickerComponent {...defaultProps} />);
      
      // Initial light theme
      let datePicker = screen.getByPlaceholderText('Select date');
      expect(datePicker).toHaveAttribute('class', expect.not.stringContaining('datepicker-input--dark'));

      // Change to dark theme
      (useTheme as jest.Mock).mockReturnValue({ theme: DARK_THEME });
      rerender(<DatePickerComponent {...defaultProps} />);

      datePicker = screen.getByPlaceholderText('Select date');
      expect(datePicker).toHaveAttribute('class', expect.stringContaining('datepicker-input--dark'));
    });
  });
});