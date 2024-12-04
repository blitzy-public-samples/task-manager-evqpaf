/**
 * Avatar Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable Avatar component for consistent user profile representation across the application.
 * 
 * Human Tasks:
 * - Verify that fallback image paths are correctly configured in the assets directory
 * - Ensure theme colors provide sufficient contrast for status indicators
 * - Test avatar rendering with various image formats and sizes
 */

import React, { useState } from 'react';
import styled from '@emotion/styled'; // @emotion/styled version 11.11.0
import { CommonStatus } from '../../../types/common.types';
import { images } from '../../../assets/images';
import { applyTheme } from '../../../styles/theme';

interface AvatarProps {
  /**
   * URL of the avatar image
   */
  src?: string;
  
  /**
   * Alternative text for the avatar image
   */
  alt: string;
  
  /**
   * Size of the avatar in pixels
   * @default '40px'
   */
  size?: string;
  
  /**
   * Status indicator for the avatar
   */
  status?: CommonStatus;
}

// Styled components for the Avatar
const AvatarContainer = styled.div<{ size: string }>`
  position: relative;
  width: ${props => props.size};
  height: ${props => props.size};
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  border: 2px solid var(--border-color);
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StatusIndicator = styled.div<{ status: CommonStatus }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--background-color);
  background-color: ${props => {
    switch (props.status) {
      case CommonStatus.ACTIVE:
        return '#4CAF50'; // Green
      case CommonStatus.INACTIVE:
        return '#9E9E9E'; // Gray
      case CommonStatus.PENDING:
        return '#FFC107'; // Yellow
      default:
        return 'transparent';
    }
  }};
`;

const Initials = styled.span`
  color: var(--text-color);
  font-size: ${props => `calc(${props.size} / 2.5)`};
  font-weight: 500;
  text-transform: uppercase;
`;

/**
 * Avatar component for displaying user profile pictures or initials.
 * Supports image fallback, status indicators, and theme integration.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = '40px',
  status
}) => {
  const [imageError, setImageError] = useState(false);

  // Generate initials from alt text
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('');
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <AvatarContainer size={size}>
      {src && !imageError ? (
        <AvatarImage
          src={src}
          alt={alt}
          onError={handleImageError}
        />
      ) : alt ? (
        <Initials size={size}>{getInitials(alt)}</Initials>
      ) : (
        <AvatarImage
          src={images.placeholders.user}
          alt="Default avatar"
        />
      )}
      {status && (
        <StatusIndicator status={status} />
      )}
    </AvatarContainer>
  );
};