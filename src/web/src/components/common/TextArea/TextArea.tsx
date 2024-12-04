/**
 * TextArea Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable and styled TextArea component for consistent user input handling across the application.
 * 
 * Human Tasks:
 * - Verify ARIA labels meet accessibility requirements
 * - Test component behavior with screen readers
 * - Ensure error states are visually distinguishable for color-blind users
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled'; // @emotion/styled@11.11.0
import { CommonStatus } from '../../../types/common.types';
import { validateEmail } from '../../../utils/validation.utils';
import { applyTheme } from '../../../styles/theme';

interface TextAreaProps {
  /**
   * The current value of the text area
   */
  value: string;
  
  /**
   * Callback function triggered on value change
   */
  onChange: (value: string) => void;
  
  /**
   * Placeholder text to display when empty
   */
  placeholder?: string;
  
  /**
   * Whether the field is required
   */
  isRequired?: boolean;
  
  /**
   * Type of validation to apply ('email' | 'text')
   */
  validationType?: 'email' | 'text';
  
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  
  /**
   * Number of rows for the text area
   */
  rows?: number;
  
  /**
   * Maximum number of characters allowed
   */
  maxLength?: number;
  
  /**
   * Whether the text area is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Label for the text area
   */
  label?: string;
  
  /**
   * ID for the text area
   */
  id?: string;
}

const StyledTextAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const StyledLabel = styled.label<{ isRequired?: boolean }>`
  font-size: 14px;
  color: var(--text-color);
  margin-bottom: 4px;
  
  ${({ isRequired }) => isRequired && `
    &::after {
      content: '*';
      color: var(--error-color, #f44336);
      margin-left: 4px;
    }
  `}
`;

const StyledTextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 16px;
  resize: vertical;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }

  &:disabled {
    background-color: var(--disabled-background-color, #f5f5f5);
    cursor: not-allowed;
    opacity: 0.7;
  }

  ${({ hasError }) => hasError && `
    border-color: var(--error-color, #f44336);
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
    }
  `}

  &::placeholder {
    color: var(--placeholder-color, #757575);
  }
`;

const ErrorMessage = styled.span`
  color: var(--error-color, #f44336);
  font-size: 12px;
  margin-top: 4px;
  min-height: 16px;
`;

const CharacterCount = styled.span`
  color: var(--secondary-text-color, #666666);
  font-size: 12px;
  text-align: right;
  margin-top: 4px;
`;

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  isRequired = false,
  validationType = 'text',
  errorMessage,
  rows = 3,
  maxLength,
  disabled = false,
  className = '',
  label,
  id,
}) => {
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  // Validate input based on type
  const validateInput = useCallback((inputValue: string) => {
    if (isRequired && !inputValue.trim()) {
      return 'This field is required';
    }

    if (validationType === 'email' && inputValue.trim()) {
      return validateEmail(inputValue) ? '' : 'Please enter a valid email address';
    }

    return '';
  }, [isRequired, validationType]);

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    onChange(newValue);
    
    if (touched) {
      const validationError = validateInput(newValue);
      setError(validationError);
    }
  };

  // Handle blur event
  const handleBlur = () => {
    setTouched(true);
    const validationError = validateInput(value);
    setError(validationError);
  };

  // Update error message when prop changes
  useEffect(() => {
    if (errorMessage !== undefined) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  // Generate unique ID if not provided
  const textAreaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <StyledTextAreaWrapper className={className}>
      {label && (
        <StyledLabel 
          htmlFor={textAreaId}
          isRequired={isRequired}
        >
          {label}
        </StyledLabel>
      )}
      
      <StyledTextArea
        id={textAreaId}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        hasError={!!error}
        aria-invalid={!!error}
        aria-required={isRequired}
        aria-describedby={error ? `${textAreaId}-error` : undefined}
      />
      
      {error && (
        <ErrorMessage 
          id={`${textAreaId}-error`}
          role="alert"
        >
          {error}
        </ErrorMessage>
      )}
      
      {maxLength && (
        <CharacterCount>
          {value.length}/{maxLength} characters
        </CharacterCount>
      )}
    </StyledTextAreaWrapper>
  );
};

export default TextArea;