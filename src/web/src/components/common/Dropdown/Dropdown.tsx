/**
 * Reusable Dropdown Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable dropdown component for consistent user interface design.
 * 
 * Human Tasks:
 * - Verify dropdown styles match the design system
 * - Test keyboard navigation and screen reader compatibility
 * - Ensure dropdown positioning works in all container contexts
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types'; // v15.8.1
import { CommonStatus } from '../../../types/common.types';
import { validateEmail } from '../../../utils/validation.utils';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import useTheme from '../../../hooks/useTheme';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  validateAsEmail?: boolean;
  status?: CommonStatus;
  width?: string;
  maxHeight?: string;
  testId?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  required = false,
  name,
  id,
  className = '',
  validateAsEmail = false,
  status = CommonStatus.ACTIVE,
  width = '100%',
  maxHeight = '300px',
  testId = 'dropdown'
}) => {
  // Get current theme
  const { theme } = useTheme();
  const currentTheme = theme === LIGHT_THEME ? LIGHT_THEME : DARK_THEME;

  // State for dropdown open/close
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle option selection
  const handleSelect = useCallback((optionValue: string) => {
    if (validateAsEmail && !validateEmail(optionValue)) {
      return;
    }
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange, validateAsEmail]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case 'Space':
        event.preventDefault();
        setIsOpen(prev => !prev);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
        }
        event.preventDefault();
        const nextOption = options.findIndex(opt => opt.value === value) + 1;
        if (nextOption < options.length) {
          handleSelect(options[nextOption].value);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevOption = options.findIndex(opt => opt.value === value) - 1;
        if (prevOption >= 0) {
          handleSelect(options[prevOption].value);
        }
        break;
    }
  }, [disabled, isOpen, options, value, handleSelect]);

  // Styles based on current theme
  const styles = {
    dropdown: {
      position: 'relative' as const,
      width,
      fontFamily: 'inherit',
      color: currentTheme.textColor,
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      border: `1px solid ${error ? '#F44336' : currentTheme.borderColor}`,
      borderRadius: '4px',
      backgroundColor: currentTheme.backgroundColor,
      color: currentTheme.textColor,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled || status === CommonStatus.INACTIVE ? 0.6 : 1,
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    options: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      maxHeight,
      overflowY: 'auto' as const,
      backgroundColor: currentTheme.backgroundColor,
      border: `1px solid ${currentTheme.borderColor}`,
      borderRadius: '4px',
      marginTop: '4px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: isOpen ? 'block' : 'none',
    },
    option: {
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: currentTheme.primaryColor + '1A', // 10% opacity
      },
    },
    error: {
      color: '#F44336',
      fontSize: '12px',
      marginTop: '4px',
    },
    required: {
      color: '#F44336',
      marginLeft: '4px',
    }
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div
      ref={dropdownRef}
      style={styles.dropdown}
      className={className}
      data-testid={testId}
    >
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id || name}-options`}
        aria-label={placeholder}
        tabIndex={disabled ? -1 : 0}
        style={styles.select}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        {selectedOption ? selectedOption.label : placeholder}
        {required && <span style={styles.required}>*</span>}
      </div>

      <div
        id={`${id || name}-options`}
        role="listbox"
        aria-label={`${placeholder} options`}
        style={styles.options}
      >
        {options.map((option) => (
          <div
            key={option.value}
            role="option"
            aria-selected={value === option.value}
            style={{
              ...styles.option,
              backgroundColor: value === option.value 
                ? currentTheme.primaryColor + '1A'
                : 'transparent',
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              opacity: option.disabled ? 0.5 : 1,
            }}
            onClick={() => !option.disabled && handleSelect(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>

      {error && (
        <div style={styles.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  validateAsEmail: PropTypes.bool,
  status: PropTypes.oneOf(Object.values(CommonStatus)),
  width: PropTypes.string,
  maxHeight: PropTypes.string,
  testId: PropTypes.string,
};

export default Dropdown;