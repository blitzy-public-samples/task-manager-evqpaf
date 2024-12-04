/**
 * Loading Component
 * 
 * Requirements Addressed:
 * - User Feedback for Loading States (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides a visual indicator for loading states to improve user experience and feedback.
 * 
 * Human Tasks:
 * - Verify that loading animation performs well on low-end devices
 * - Ensure loading indicator contrast meets WCAG accessibility guidelines
 * - Test loading states with screen readers for accessibility
 */

import React from 'react';
import styled, { keyframes } from 'styled-components'; // @version 5.3.10
import { CommonStatus } from '../../../types/common.types';
import { applyTheme } from '../../../styles/theme';

// Props interface for the Loading component
interface LoadingProps {
  isLoading: boolean;
  message?: string;
}

// Keyframe animation for the spinner rotation
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled container for the loading component
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  min-height: 100px;
`;

// Styled spinner component
const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin-bottom: 1rem;
`;

// Styled message component
const LoadingMessage = styled.p`
  color: var(--text-color);
  font-size: 1rem;
  text-align: center;
  margin: 0;
  padding: 0;
  opacity: 0.8;
`;

/**
 * Loading component that displays a spinner and optional message
 * during loading states.
 * 
 * @param isLoading - Boolean flag indicating if loading state is active
 * @param message - Optional message to display below the spinner
 * @returns JSX.Element - The rendered loading component
 */
const Loading: React.FC<LoadingProps> = ({ isLoading, message }) => {
  // Don't render anything if not in loading state
  if (!isLoading) {
    return null;
  }

  // Apply current theme to ensure consistent styling
  React.useEffect(() => {
    applyTheme(window.theme);
  }, []);

  // Set ARIA attributes for accessibility
  const loadingStatus = isLoading ? CommonStatus.PENDING : CommonStatus.ACTIVE;
  const ariaLabel = message || 'Loading in progress';

  return (
    <LoadingContainer
      role="alert"
      aria-busy={isLoading}
      aria-label={ariaLabel}
      data-testid="loading-indicator"
      data-status={loadingStatus}
    >
      <Spinner 
        role="progressbar"
        aria-valuetext={message}
      />
      {message && (
        <LoadingMessage aria-live="polite">
          {message}
        </LoadingMessage>
      )}
    </LoadingContainer>
  );
};

export default Loading;