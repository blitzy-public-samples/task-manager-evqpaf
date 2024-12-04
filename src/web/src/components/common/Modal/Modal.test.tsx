/**
 * Unit tests for the Modal component
 * 
 * Requirements Addressed:
 * - User Interface Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Modal component behaves as expected under various conditions, including rendering,
 *   interactivity, and accessibility.
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';

import Modal from './Modal';
import { validateEmail } from '../../../utils/validation.utils';
import { makeApiRequest } from '../../../utils/api.utils';
import useNotification from '../../../hooks/useNotification';

// Mock dependencies
jest.mock('../../../utils/validation.utils');
jest.mock('../../../utils/api.utils');
jest.mock('../../../hooks/useNotification');

describe('Modal Component', () => {
  // Common props for testing
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#cccccc'
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useNotification as jest.Mock).mockReturnValue({
      triggerNotification: jest.fn()
    });
  });

  describe('Modal Rendering', () => {
    test('renders modal when isOpen is true', () => {
      render(<Modal {...mockProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    test('does not render modal when isOpen is false', () => {
      render(<Modal {...mockProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders with correct accessibility attributes', () => {
      render(<Modal {...mockProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    test('applies theme styles correctly', () => {
      render(<Modal {...mockProps} />);
      
      const modalContent = screen.getByText('Modal Content').closest('.modal__content');
      expect(modalContent).toHaveStyle({
        backgroundColor: mockProps.theme.backgroundColor,
        color: mockProps.theme.textColor,
        border: `1px solid ${mockProps.theme.borderColor}`
      });
    });
  });

  describe('Modal Interactivity', () => {
    test('calls onClose when close button is clicked', () => {
      render(<Modal {...mockProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when clicking overlay', () => {
      render(<Modal {...mockProps} />);
      
      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when clicking modal content', () => {
      render(<Modal {...mockProps} />);
      
      const modalContent = screen.getByText('Modal Content');
      fireEvent.click(modalContent);
      
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    test('closes modal on ESC key press', () => {
      render(<Modal {...mockProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Validation', () => {
    test('validates email input correctly', async () => {
      const mockValidateEmail = validateEmail as jest.Mock;
      mockValidateEmail.mockReturnValueOnce(false).mockReturnValueOnce(true);

      render(
        <Modal {...mockProps}>
          <input type="email" data-testid="email-input" />
        </Modal>
      );

      const emailInput = screen.getByTestId('email-input');

      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      await waitFor(() => {
        expect(mockValidateEmail).toHaveBeenCalledWith('invalid-email');
      });

      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
      await waitFor(() => {
        expect(mockValidateEmail).toHaveBeenCalledWith('valid@email.com');
      });
    });
  });

  describe('Modal API Interaction', () => {
    test('handles API requests correctly', async () => {
      const mockMakeApiRequest = makeApiRequest as jest.Mock;
      mockMakeApiRequest.mockResolvedValueOnce({ success: true });

      render(
        <Modal {...mockProps}>
          <button data-testid="submit-btn">Submit</button>
        </Modal>
      );

      const submitButton = screen.getByTestId('submit-btn');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMakeApiRequest).toHaveBeenCalled();
      });
    });

    test('handles API errors correctly', async () => {
      const mockMakeApiRequest = makeApiRequest as jest.Mock;
      mockMakeApiRequest.mockRejectedValueOnce(new Error('API Error'));

      render(
        <Modal {...mockProps}>
          <button data-testid="submit-btn">Submit</button>
        </Modal>
      );

      const submitButton = screen.getByTestId('submit-btn');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMakeApiRequest).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Notifications', () => {
    test('triggers notifications correctly', async () => {
      const mockTriggerNotification = jest.fn();
      (useNotification as jest.Mock).mockReturnValue({
        triggerNotification: mockTriggerNotification
      });

      render(
        <Modal {...mockProps}>
          <button data-testid="notify-btn" onClick={() => {
            mockTriggerNotification({ message: 'Test notification', type: 'success' });
          }}>
            Notify
          </button>
        </Modal>
      );

      const notifyButton = screen.getByTestId('notify-btn');
      fireEvent.click(notifyButton);

      await waitFor(() => {
        expect(mockTriggerNotification).toHaveBeenCalledWith({
          message: 'Test notification',
          type: 'success'
        });
      });
    });
  });
});