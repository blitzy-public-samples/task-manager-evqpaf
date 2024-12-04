/**
 * Reusable Checkbox Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable and accessible Checkbox component for consistent user interface design.
 * 
 * Human Tasks:
 * - Verify ARIA labels meet accessibility requirements
 * - Test keyboard navigation functionality
 * - Ensure color contrast meets WCAG guidelines
 */

import React, { ChangeEvent, useId } from 'react';
import styled from 'styled-components';
import { CommonStatus } from '../../../types/common.types';
import { validateEmail } from '../../../utils/validation.utils';
import { applyTheme } from '../../../styles/theme';

// Interface for Checkbox props
interface CheckboxProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
  className?: string;
}

// Styled components for the Checkbox
const CheckboxContainer = styled.div<{ hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.6' : '1'};
  
  &:hover input:not(:disabled) + span {
    border-color: var(--primary-color);
  }
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const StyledCheckbox = styled.span<{ checked: boolean; hasError?: boolean }>`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.hasError ? 'var(--error-color, #dc3545)' : 'var(--border-color)'};
  border-radius: 3px;
  background: ${props => props.checked ? 'var(--primary-color)' : 'transparent'};
  transition: all 0.2s ease-in-out;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    display: ${props => props.checked ? 'block' : 'none'};
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-color);
  user-select: none;
`;

const ErrorText = styled.span`
  color: var(--error-color, #dc3545);
  font-size: 12px;
  margin-top: 4px;
  display: block;
`;

const RequiredIndicator = styled.span`
  color: var(--error-color, #dc3545);
  margin-left: 2px;
`;

/**
 * Checkbox component that follows WAI-ARIA best practices for accessibility.
 * 
 * @param checked - Boolean indicating if the checkbox is checked
 * @param label - Text label for the checkbox
 * @param onChange - Callback function when checkbox state changes
 * @param disabled - Optional boolean to disable the checkbox
 * @param error - Optional error message to display
 * @param required - Optional boolean to mark the checkbox as required
 * @param name - Optional name attribute for the checkbox input
 * @param className - Optional className for styling
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  label,
  onChange,
  disabled = false,
  error,
  required = false,
  name,
  className
}) => {
  // Generate unique ID for input-label association
  const id = useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(event.target.checked);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <div className={className}>
      <CheckboxContainer
        disabled={disabled}
        hasError={!!error}
        onClick={() => !disabled && onChange(!checked)}
      >
        <HiddenCheckbox
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <StyledCheckbox
          checked={checked}
          hasError={!!error}
          role="presentation"
          tabIndex={0}
          onKeyPress={handleKeyPress}
        />
        <Label htmlFor={id}>
          {label}
          {required && <RequiredIndicator aria-hidden="true">*</RequiredIndicator>}
        </Label>
      </CheckboxContainer>
      {error && (
        <ErrorText id={`${id}-error`} role="alert">
          {error}
        </ErrorText>
      )}
    </div>
  );
};