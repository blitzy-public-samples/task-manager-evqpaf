// @testing-library/react v14.0.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// jest v29.0.0
import '@testing-library/jest-dom';
import React from 'react';

import Notification from './Notification';
import { makeApiRequest } from '../../../utils/api.utils';
import { BASE_API_URL } from '../../../constants/api.constants';
import { validateEmail } from '../../../utils/validation.utils';

// Mock dependencies
jest.mock('../../../utils/api.utils');
jest.mock('../../../utils/validation.utils');
jest.mock('../../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    dismissNotification: jest.fn()
  })
}));

/**
 * Requirements Addressed:
 * - Component Testing (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Ensures the Notification component behaves as expected under various user interactions and scenarios.
 */

describe('Notification Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case: renders notification with default props
  test('renders notification with default props', () => {
    const message = 'Test notification message';
    render(
      <Notification
        message={message}
        type="info"
      />
    );

    // Assert message is displayed
    expect(screen.getByText(message)).toBeInTheDocument();
    
    // Assert default theme is applied
    const notification = screen.getByRole('alert');
    expect(notification).toHaveStyle({
      position: 'relative',
      padding: '12px 16px',
      borderRadius: '4px'
    });

    // Assert close button is present
    expect(screen.getByLabelText('Close notification')).toBeInTheDocument();
  });

  // Test case: handles dismiss action
  test('handles dismiss action', async () => {
    const onClose = jest.fn();
    const notificationId = 'test-id';

    render(
      <Notification
        id={notificationId}
        message="Test message"
        type="info"
        onClose={onClose}
      />
    );

    // Click dismiss button
    fireEvent.click(screen.getByLabelText('Close notification'));

    // Assert API call was made
    await waitFor(() => {
      expect(makeApiRequest).toHaveBeenCalledWith(
        `${BASE_API_URL}/notifications/${notificationId}/dismiss`,
        { method: 'PUT' }
      );
    });

    // Assert onClose callback was called
    expect(onClose).toHaveBeenCalled();
  });

  // Test case: triggers action on button click
  test('triggers action on button click', () => {
    const actionCallback = jest.fn();
    const actionLabel = 'Action Button';

    render(
      <Notification
        message="Test message"
        type="info"
        actions={[
          {
            label: actionLabel,
            onClick: actionCallback,
            variant: 'primary'
          }
        ]}
      />
    );

    // Click action button
    fireEvent.click(screen.getByText(actionLabel));

    // Assert callback was called
    expect(actionCallback).toHaveBeenCalledTimes(1);
  });

  // Test case: renders different notification types
  test.each(['success', 'error', 'warning', 'info'] as const)(
    'renders %s notification type correctly',
    (type) => {
      render(
        <Notification
          message="Test message"
          type={type}
        />
      );

      const notification = screen.getByRole('alert');
      expect(notification).toHaveStyle({
        borderLeft: expect.stringContaining('4px solid')
      });
    }
  );

  // Test case: auto-dismisses after duration
  test('auto-dismisses after duration', async () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const duration = 1000;

    render(
      <Notification
        message="Test message"
        type="info"
        duration={duration}
        onClose={onClose}
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(duration);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  // Test case: handles API error during dismiss
  test('handles API error during dismiss', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('API Error');
    (makeApiRequest as jest.Mock).mockRejectedValueOnce(error);

    render(
      <Notification
        id="test-id"
        message="Test message"
        type="info"
      />
    );

    // Click dismiss button
    fireEvent.click(screen.getByLabelText('Close notification'));

    // Assert error was logged
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to dismiss notification:',
        error
      );
    });

    consoleError.mockRestore();
  });

  // Test case: renders with custom theme
  test('renders with dark theme', () => {
    render(
      <Notification
        message="Test message"
        type="info"
        theme="dark"
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveStyle({
      backgroundColor: expect.any(String),
      color: expect.any(String)
    });
  });
});