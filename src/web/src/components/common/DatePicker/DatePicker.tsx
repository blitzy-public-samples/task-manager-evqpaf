/**
 * DatePicker Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable and accessible DatePicker component for consistent date selection across the application.
 * 
 * Human Tasks:
 * - Verify date format patterns match localization requirements
 * - Test keyboard navigation and accessibility features
 * - Ensure date validation rules align with business requirements
 */

// External dependencies
// react-datepicker v4.8.0
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// classnames v2.3.2
import classNames from 'classnames';

// Internal dependencies
import { CommonStatus } from '../../../types/common.types';
import { formatDate } from '../../../utils/date.utils';
import { applyTheme } from '../../../styles/theme';
import useTheme from '../../../hooks/useTheme';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  className
}) => {
  // Get current theme
  const { theme } = useTheme();

  // Apply theme to component
  const datePickerStyles = {
    '--datepicker-primary-color': theme.primaryColor,
    '--datepicker-background': theme.backgroundColor,
    '--datepicker-text-color': theme.textColor,
    '--datepicker-border-color': theme.borderColor
  } as React.CSSProperties;

  // Custom input classes based on theme and state
  const inputClasses = classNames(
    'datepicker-input',
    {
      'datepicker-input--dark': theme === 'dark',
      'datepicker-input--disabled': disabled
    },
    className
  );

  return (
    <div className="datepicker-container" style={datePickerStyles}>
      <ReactDatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => {
          onChange(date);
        }}
        dateFormat="MMMM d, yyyy" // Using consistent date format from date.utils
        placeholderText={placeholder}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        className={inputClasses}
        calendarClassName={classNames('datepicker-calendar', {
          'datepicker-calendar--dark': theme === 'dark'
        })}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        isClearable
        autoComplete="off"
        formatWeekDay={day => day.substring(0, 3)} // Show abbreviated weekday names
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled
        }) => (
          <div className="datepicker-header">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="datepicker-nav-button"
            >
              {'<'}
            </button>
            <span className="datepicker-header-text">
              {formatDate(date, 'MEDIUM')}
            </span>
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="datepicker-nav-button"
            >
              {'>'}
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default DatePickerComponent;