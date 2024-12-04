/**
 * Dialog Component Tests
 * 
 * Requirements Addressed:
 * - Testing Requirements (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
 *   Ensures the Dialog component behaves as expected under various scenarios,
 *   including rendering and event handling.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user interactions are tested
 * - Review accessibility testing requirements
 */

// @testing-library/react v13.4.0
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from './Dialog';
import { setupTests } from '../../../../tests/setup';
import { initializeMockServer } from '../../../../tests/mocks/server';
import { mockGetTasksHandler } from '../../../../tests/mocks/handlers';

// Initialize test environment
setupTests();
initializeMockServer();

describe('Dialog Component', () => {
  // Common props for testing
  const defaultProps = {
    title: 'Test Dialog',
    content: <div>Test Content</div>,
    actions: <button>Close</button>,
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dialog when isOpen is true', () => {
      render(<Dialog {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should not render the dialog when isOpen is false', () => {
      render(<Dialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should render with proper ARIA attributes', () => {
      render(<Dialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    });
  });

  describe('Event Handling', () => {
    it('should call onClose when clicking the close button', () => {
      render(<Dialog {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close dialog' });
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside the dialog', () => {
      render(<Dialog {...defaultProps} />);
      
      const overlay = screen.getByRole('presentation');
      fireEvent.mouseDown(overlay);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking inside the dialog', () => {
      render(<Dialog {...defaultProps} />);
      
      const dialogContent = screen.getByText('Test Content');
      fireEvent.mouseDown(dialogContent);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when pressing Escape key', () => {
      render(<Dialog {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when pressing other keys', () => {
      render(<Dialog {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme styles when rendered', () => {
      render(<Dialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // Verify theme-related styles are applied
      expect(dialog).toHaveStyle({
        backgroundColor: expect.any(String),
        color: expect.any(String),
        borderRadius: '8px',
        border: expect.stringContaining('1px solid')
      });
    });
  });

  describe('Body Scroll Management', () => {
    it('should prevent body scroll when dialog is open', () => {
      render(<Dialog {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when dialog is closed', () => {
      const { rerender } = render(<Dialog {...defaultProps} />);
      
      rerender(<Dialog {...defaultProps} isOpen={false} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(<Dialog {...defaultProps} />);
      
      unmount();
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Animation States', () => {
    it('should have correct initial animation states when open', () => {
      render(<Dialog {...defaultProps} />);
      
      const overlay = screen.getByRole('presentation');
      const dialog = screen.getByRole('dialog');
      
      expect(overlay).toHaveStyle({
        opacity: 1,
        transition: 'opacity 0.2s ease-in-out'
      });
      
      expect(dialog).toHaveStyle({
        transform: 'scale(1)',
        transition: 'transform 0.2s ease-in-out'
      });
    });
  });

  describe('Content Rendering', () => {
    it('should render complex content correctly', () => {
      const complexContent = (
        <div>
          <h3>Complex Content</h3>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </div>
      );
      
      render(<Dialog {...defaultProps} content={complexContent} />);
      
      expect(screen.getByText('Complex Content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('should render multiple action buttons', () => {
      const actions = (
        <>
          <button>Cancel</button>
          <button>Confirm</button>
        </>
      );
      
      render(<Dialog {...defaultProps} actions={actions} />);
      
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });
});