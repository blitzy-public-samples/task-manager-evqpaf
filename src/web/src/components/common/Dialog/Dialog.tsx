/**
 * Dialog Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable and customizable dialog component for consistent modal dialogs across the application.
 * 
 * Human Tasks:
 * - Verify dialog animations work smoothly across different browsers
 * - Ensure dialog meets accessibility standards (ARIA attributes, keyboard navigation)
 * - Test dialog responsiveness on different screen sizes
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types'; // v15.8.1
import { CommonStatus } from '../../../types/common.types';
import { validateEmail } from '../../../utils/validation.utils';
import { applyTheme } from '../../../styles/theme';
import useTheme from '../../../hooks/useTheme';

interface DialogProps {
  title: string;
  content: React.ReactNode;
  actions: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({
  title,
  content,
  actions,
  isOpen,
  onClose
}) => {
  // Get current theme
  const { theme } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Apply theme when it changes
  useEffect(() => {
    if (isOpen) {
      applyTheme(theme);
    }
  }, [theme, isOpen]);

  // Handle ESC key press to close dialog
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside dialog to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current && 
        !dialogRef.current.contains(event.target as Node) && 
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-overlay"
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="dialog"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transform: isOpen ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.2s ease-in-out',
          border: `1px solid ${theme.borderColor}`
        }}
      >
        <div className="dialog-header">
          <h2
            id="dialog-title"
            style={{
              margin: 0,
              marginBottom: '16px',
              color: theme.primaryColor,
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: theme.textColor,
              fontSize: '1.5rem',
              lineHeight: 1,
              opacity: 0.7,
              transition: 'opacity 0.2s ease-in-out'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            ×
          </button>
        </div>

        <div
          className="dialog-content"
          style={{
            marginBottom: '24px'
          }}
        >
          {content}
        </div>

        <div
          className="dialog-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          {actions}
        </div>
      </div>
    </div>
  );
};

Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  actions: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Dialog;