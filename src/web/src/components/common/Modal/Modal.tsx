/**
 * Modal Component
 * 
 * Requirements Addressed:
 * - User Interface Design (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable modal component for displaying dialogs, ensuring consistency and accessibility across the application.
 * 
 * Human Tasks:
 * - Verify modal animations work smoothly across different browsers
 * - Test modal focus management with screen readers
 * - Ensure modal overlay click behavior works as expected
 */

import React, { useEffect, useRef } from 'react';
// react v18.2.0
import classnames from 'classnames'; // v2.3.2
import { ThemeType } from '../../../types/theme.types';
import { applyTheme } from '../../../styles/theme';
import useTheme from '../../../hooks/useTheme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme?: ThemeType;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  theme: propTheme
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { theme: currentTheme } = useTheme();
  const activeTheme = propTheme || currentTheme;

  // Apply theme to modal
  useEffect(() => {
    if (isOpen && activeTheme) {
      applyTheme(activeTheme);
    }
  }, [isOpen, activeTheme]);

  // Handle ESC key press to close modal
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

  // Trap focus within modal when open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstFocusable) {
              event.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              event.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstFocusable?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
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

  const modalClasses = classnames('modal', {
    'modal--open': isOpen,
    'modal--closed': !isOpen
  });

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={modalClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div
        ref={modalRef}
        className="modal__content"
        style={{
          backgroundColor: activeTheme.backgroundColor,
          color: activeTheme.textColor,
          border: `1px solid ${activeTheme.borderColor}`,
          borderRadius: '4px',
          padding: '20px',
          maxWidth: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          transform: isOpen ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="modal__header">
          <h2 
            id="modal-title"
            style={{
              margin: 0,
              marginBottom: '16px',
              color: activeTheme.primaryColor
            }}
          >
            {title}
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: activeTheme.textColor
            }}
          >
            ✕
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;