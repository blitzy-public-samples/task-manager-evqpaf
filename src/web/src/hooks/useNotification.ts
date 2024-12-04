/**
 * Custom React Hook for Managing Notifications
 * 
 * Requirements Addressed:
 * - State Management and Notifications (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides a centralized mechanism for managing notifications in the application,
 *   ensuring consistency and state synchronization.
 * 
 * Human Tasks:
 * - Verify notification display duration aligns with UX requirements
 * - Ensure notification styles match the design system
 * - Configure appropriate notification sound effects if required
 */

// react-redux v8.0.5
import { useDispatch, useSelector } from 'react-redux';
import { CommonStatus } from '../types/common.types';
import { BASE_API_URL } from '../constants/api.constants';
import { makeApiRequest } from '../utils/api.utils';
import store from '../store/store';

// Types for notification management
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  status: CommonStatus;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

// Action types for notification management
const NOTIFICATION_ACTIONS = {
  ADD: 'notification/add',
  UPDATE: 'notification/update',
  DISMISS: 'notification/dismiss',
  SET_LOADING: 'notification/setLoading',
  SET_ERROR: 'notification/setError',
} as const;

/**
 * Custom hook for managing notifications in the application
 * Provides methods to trigger, update, and dismiss notifications
 */
const useNotification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: { notification: NotificationState }) => 
    state.notification.notifications
  );

  /**
   * Triggers a new notification
   * @param notification - The notification configuration
   */
  const triggerNotification = async (notification: Omit<Notification, 'id' | 'status'>) => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });

      // Make API request to create notification
      const response = await makeApiRequest(`${BASE_API_URL}/notifications`, {
        method: 'POST',
        data: {
          ...notification,
          status: CommonStatus.ACTIVE
        }
      });

      dispatch({
        type: NOTIFICATION_ACTIONS.ADD,
        payload: response
      });

      // Auto-dismiss notification after duration if specified
      if (notification.duration) {
        setTimeout(() => {
          dismissNotification(response.id);
        }, notification.duration);
      }
    } catch (error) {
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error instanceof Error ? error.message : 'Failed to create notification'
      });
    } finally {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Updates an existing notification
   * @param id - The ID of the notification to update
   * @param updates - The updates to apply to the notification
   */
  const updateNotification = async (
    id: string,
    updates: Partial<Omit<Notification, 'id'>>
  ) => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });

      // Make API request to update notification
      const response = await makeApiRequest(`${BASE_API_URL}/notifications/${id}`, {
        method: 'PUT',
        data: updates
      });

      dispatch({
        type: NOTIFICATION_ACTIONS.UPDATE,
        payload: response
      });
    } catch (error) {
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error instanceof Error ? error.message : 'Failed to update notification'
      });
    } finally {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Dismisses a notification by setting its status to INACTIVE
   * @param id - The ID of the notification to dismiss
   */
  const dismissNotification = async (id: string) => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });

      // Make API request to update notification status
      await makeApiRequest(`${BASE_API_URL}/notifications/${id}`, {
        method: 'PUT',
        data: {
          status: CommonStatus.INACTIVE
        }
      });

      dispatch({
        type: NOTIFICATION_ACTIONS.DISMISS,
        payload: id
      });
    } catch (error) {
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error instanceof Error ? error.message : 'Failed to dismiss notification'
      });
    } finally {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
    }
  };

  return {
    notifications,
    triggerNotification,
    updateNotification,
    dismissNotification
  };
};

export default useNotification;