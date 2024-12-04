/**
 * Reusable Button Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a consistent and reusable button component for various actions across the application.
 * 
 * Human Tasks:
 * - Verify button styles match design system specifications
 * - Ensure button states (hover, active, disabled) meet accessibility guidelines
 * - Test button component with screen readers for proper ARIA support
 */

import React from 'react'; // v18.2.0
import styled from 'styled-components'; // v6.0.0
import { CommonStatus } from '../../../types/common.types';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import { capitalize } from '../../../utils/string.utils';
import { applyTheme } from '../../../styles/theme';

interface ButtonProps {
  label: string;
  status?: CommonStatus;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface StyledButtonProps {
  $status?: CommonStatus;
  $theme: typeof LIGHT_THEME | typeof DARK_THEME;
}

const StyledButton = styled.button<StyledButtonProps>`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease-in-out;
  outline: none;
  border: 1px solid;

  /* Status-based styling */
  ${props => {
    switch (props.$status) {
      case CommonStatus.ACTIVE:
        return `
          background-color: ${props.$theme.primaryColor};
          color: #FFFFFF;
          border-color: ${props.$theme.primaryColor};
          &:hover:not(:disabled) {
            background-color: ${props.$theme.secondaryColor};
            border-color: ${props.$theme.secondaryColor};
          }
        `;
      case CommonStatus.INACTIVE:
        return `
          background-color: ${props.$theme.borderColor};
          color: ${props.$theme.textColor};
          border-color: ${props.$theme.borderColor};
          &:hover:not(:disabled) {
            opacity: 0.8;
          }
        `;
      case CommonStatus.PENDING:
        return `
          background-color: transparent;
          color: ${props.$theme.primaryColor};
          border-color: ${props.$theme.primaryColor};
          &:hover:not(:disabled) {
            background-color: ${props.$theme.primaryColor}10;
          }
        `;
      default:
        return `
          background-color: ${props.$theme.primaryColor};
          color: #FFFFFF;
          border-color: ${props.$theme.primaryColor};
          &:hover:not(:disabled) {
            background-color: ${props.$theme.secondaryColor};
            border-color: ${props.$theme.secondaryColor};
          }
        `;
    }
  }}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    background-color: ${props => props.$theme.borderColor};
    border-color: ${props => props.$theme.borderColor};
    color: ${props => props.$theme.textColor};
  }

  /* Active/Focus states */
  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${props => props.$theme.backgroundColor},
                0 0 0 4px ${props => props.$theme.primaryColor};
  }
`;

export const Button: React.FC<ButtonProps> = ({
  label,
  status = CommonStatus.ACTIVE,
  disabled = false,
  onClick
}) => {
  // Get current theme
  const theme = applyTheme(LIGHT_THEME); // Default to light theme if theme application fails

  return (
    <StyledButton
      $status={status}
      $theme={theme}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      role="button"
      type="button"
    >
      {capitalize(label)}
    </StyledButton>
  );
};