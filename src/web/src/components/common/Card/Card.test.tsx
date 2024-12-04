// React v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { capitalize } from '../../../utils/string.utils';

/**
 * Requirements Addressed:
 * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Card component behaves as expected under different conditions and inputs.
 */

describe('Card Component', () => {
  // Test basic rendering
  test('renders card with title, content and status', () => {
    const title = 'test title';
    const content = 'test content';
    const status = 'active';

    render(
      <Card title={title} status={status}>
        {content}
      </Card>
    );

    // Check if title is rendered and capitalized
    expect(screen.getByText(capitalize(title))).toBeInTheDocument();
    
    // Check if content is rendered
    expect(screen.getByText(content)).toBeInTheDocument();
    
    // Check if status is rendered and capitalized
    expect(screen.getByText(capitalize(status))).toBeInTheDocument();
  });

  // Test rendering without optional props
  test('renders card without title and status', () => {
    const content = 'test content';

    render(
      <Card>
        {content}
      </Card>
    );

    // Check if content is rendered
    expect(screen.getByText(content)).toBeInTheDocument();
    
    // Check that header and footer are not rendered
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByText(/active|inactive|pending/i)).not.toBeInTheDocument();
  });

  // Test custom className
  test('applies custom className', () => {
    const customClass = 'custom-card';
    const content = 'test content';

    const { container } = render(
      <Card className={customClass}>
        {content}
      </Card>
    );

    // Check if custom class is applied
    expect(container.firstChild).toHaveClass('card', customClass);
  });

  // Test header rendering
  test('renders header with title', () => {
    const title = 'test title';
    const content = 'test content';

    render(
      <Card title={title}>
        {content}
      </Card>
    );

    // Check header rendering
    const header = screen.getByRole('heading');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent(capitalize(title));
  });

  // Test footer rendering with different status values
  test.each([
    ['active', 'var(--primary-color)'],
    ['inactive', '#757575'],
    ['pending', 'var(--secondary-color)']
  ])('renders footer with %s status in correct color', (status, expectedColor) => {
    const content = 'test content';

    render(
      <Card status={status}>
        {content}
      </Card>
    );

    // Check status text and color
    const statusElement = screen.getByText(capitalize(status));
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveStyle({ color: expectedColor });
  });

  // Test children rendering
  test('renders complex children content', () => {
    const complexContent = (
      <div data-testid="complex-content">
        <h4>Nested Title</h4>
        <p>Nested paragraph</p>
        <button>Nested button</button>
      </div>
    );

    render(
      <Card>
        {complexContent}
      </Card>
    );

    // Check if complex content is rendered correctly
    expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    expect(screen.getByText('Nested Title')).toBeInTheDocument();
    expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Test card interactions
  test('handles click events on interactive elements', () => {
    const handleClick = jest.fn();
    
    render(
      <Card>
        <button onClick={handleClick}>Click me</button>
      </Card>
    );

    // Simulate click event
    fireEvent.click(screen.getByText('Click me'));
    
    // Verify click handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test style application
  test('applies correct styles to card elements', () => {
    const title = 'test title';
    const content = 'test content';
    const status = 'active';

    const { container } = render(
      <Card title={title} status={status}>
        {content}
      </Card>
    );

    // Check card container styles
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveStyle({
      backgroundColor: 'var(--background-color)',
      borderRadius: '8px',
      overflow: 'hidden'
    });

    // Check header styles
    const headerElement = screen.getByText(capitalize(title)).parentElement;
    expect(headerElement).toHaveStyle({
      padding: '1rem',
      borderBottom: 'var(--border-color) 1px solid',
      backgroundColor: 'var(--background-color)'
    });

    // Check body styles
    const bodyElement = screen.getByText(content).parentElement;
    expect(bodyElement).toHaveStyle({
      padding: '1rem',
      color: 'var(--text-color)'
    });
  });
});