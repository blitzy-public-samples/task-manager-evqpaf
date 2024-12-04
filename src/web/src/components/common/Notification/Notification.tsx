/**
 * Notification Component
 * 
 * Requirements Addressed:
 * - State Management and Notifications (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides a centralized mechanism for managing notifications in the application,
 *   ensuring consistency and state synchronization.
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Supports light and dark themes for notifications, ensuring accessibility and user preference compliance.
 * 
 * Human Tasks:
 * - Verify notification animations match design specifications
 * - Ensure notification sounds are properly configured
 * - Test notification accessibility with screen readers
 * - Validate notification contrast ratios for both themes
 */

// react v18.2.0
import React, { useEffect, useCallback } from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

import useNotification from '../../../hooks/useNotification';
import { makeApiRequest } from '../../../utils/api.utils';
import { BASE_API_URL } from '../../../constants/api.constants';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import type { ThemeType } from '../../../types/theme.types';

interface NotificationProps {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  theme?: 'light' | 'dark';
  onClose?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

const getNotificationStyles = (type: string, theme: ThemeType) => {
  const baseStyles: React.CSSProperties = {
    position: 'relative',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    border: `1px solid ${theme.borderColor}`,
    transition: 'all 0.3s ease',
  };

  const typeStyles = {
    success: {
      borderLeft: '4px solid #4CAF50',
    },
    error: {
      borderLeft: '4px solid #F44336',
    },
    warning: {
      borderLeft: '4px solid #FFC107',
    },
    info: {
      borderLeft: '4px solid #2196F3',
    },
  };

  return {
    ...baseStyles,
    ...typeStyles[type as keyof typeof typeStyles],
  };
};

const getActionButtonStyles = (
  variant: 'primary' | 'secondary' = 'secondary',
  theme: ThemeType
): React.CSSProperties => ({
  padding: '6px 12px',
  marginLeft: '8px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: variant === 'primary' ? theme.primaryColor : 'transparent',
  color: variant === 'primary' ? '#FFFFFF' : theme.primaryColor,
  transition: 'all 0.2s ease',
  ':hover': {
    opacity: 0.9,
  },
});

const Notification: React.FC<NotificationProps> = ({
  id,
  message,
  type = 'info',
  duration = 5000,
  theme = 'light',
  onClose,
  actions = [],
}) => {
  const { dismissNotification } = useNotification();
  const currentTheme = theme === 'light' ? LIGHT_THEME : DARK_THEME;

  const handleDismiss = useCallback(async () => {
    if (id) {
      try {
        await makeApiRequest(`${BASE_API_URL}/notifications/${id}/dismiss`, {
          method: 'PUT',
        });
      } catch (error) {
        console.error('Failed to dismiss notification:', error);
      }
    }

    if (onClose) {
      onClose();
    }

    if (id) {
      dismissNotification(id);
    }
  }, [id, dismissNotification, onClose]);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={getNotificationStyles(type, currentTheme)}
    >
      <div style={{ flex: 1 }}>{message}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {actions.map((action, index) => (
          <button
            key={`${action.label}-${index}`}
            onClick={action.onClick}
            style={getActionButtonStyles(action.variant, currentTheme)}
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={handleDismiss}
          aria-label="Close notification"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '8px',
            color: currentTheme.textColor,
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

Notification.propTypes = {
  id: PropTypes.string,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  duration: PropTypes.number,
  theme: PropTypes.oneOf(['light', 'dark']),
  onClose: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary']),
    })
  ),
};

export default Notification;