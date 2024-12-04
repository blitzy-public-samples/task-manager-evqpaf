// @testing-library/react version 13.4.0
import { render, screen } from '@testing-library/react';
// @jest/globals version 29.0.0
import { expect } from '@jest/globals';
import Loading from './Loading';

/**
 * Loading Component Unit Tests
 * 
 * Requirements Addressed:
 * - Component Testing (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures the Loading component provides accurate feedback and adheres to design specifications.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure accessibility testing tools are properly configured
 * - Validate loading animation performance on target devices
 */

describe('Loading Component', () => {
  it('renders loading spinner when isLoading is true', () => {
    // Render component with loading state
    render(<Loading isLoading={true} />);

    // Query for loading indicator using test ID
    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toBeInTheDocument();

    // Verify spinner is present
    const spinner = loadingIndicator.querySelector('[role="progressbar"]');
    expect(spinner).toBeInTheDocument();

    // Verify ARIA attributes
    expect(loadingIndicator).toHaveAttribute('role', 'alert');
    expect(loadingIndicator).toHaveAttribute('aria-busy', 'true');
    expect(loadingIndicator).toHaveAttribute('aria-label', 'Loading in progress');
  });

  it('renders message when provided', () => {
    const testMessage = 'Loading test data...';
    
    // Render component with loading state and message
    render(<Loading isLoading={true} message={testMessage} />);

    // Verify message is displayed
    const message = screen.getByText(testMessage);
    expect(message).toBeInTheDocument();

    // Verify ARIA attributes for message
    expect(message).toHaveAttribute('aria-live', 'polite');

    // Verify loading indicator has correct aria-label
    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toHaveAttribute('aria-label', testMessage);
  });

  it('does not render when not loading', () => {
    // Render component with loading state false
    render(<Loading isLoading={false} />);

    // Verify loading indicator is not present
    const loadingIndicator = screen.queryByTestId('loading-indicator');
    expect(loadingIndicator).not.toBeInTheDocument();

    // Verify no spinner is rendered
    const spinner = screen.queryByRole('progressbar');
    expect(spinner).not.toBeInTheDocument();
  });

  it('applies correct loading status', () => {
    // Render component with loading state
    render(<Loading isLoading={true} />);

    // Verify loading status is set to PENDING
    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toHaveAttribute('data-status', 'PENDING');
  });

  it('handles empty message prop gracefully', () => {
    // Render component with empty message
    render(<Loading isLoading={true} message="" />);

    // Verify default aria-label is used
    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toHaveAttribute('aria-label', 'Loading in progress');

    // Verify no empty message element is rendered
    const messages = screen.queryAllByRole('paragraph');
    expect(messages).toHaveLength(0);
  });
});