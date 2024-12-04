// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from './Tooltip';
import { LIGHT_THEME, DARK_THEME } from '../../../constants/theme.constants';
import { validateEmail } from '../../../utils/validation.utils';

/**
 * Test suite for the Tooltip component.
 * 
 * Requirements Addressed:
 * - User Interface Design (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Tooltip component behaves as expected and adheres to accessibility and design standards.
 */

describe('Tooltip Component', () => {
  // Mock timers for delay testing
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Basic rendering tests
  test('renders children correctly', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  test('matches snapshot', () => {
    const { container } = render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(container).toMatchSnapshot();
  });

  // Hover behavior tests
  test('shows tooltip on hover', async () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(200); // Default show delay
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Test tooltip')).toBeInTheDocument();
  });

  test('hides tooltip when mouse leaves', async () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    
    // Show tooltip
    fireEvent.mouseEnter(trigger);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Hide tooltip
    fireEvent.mouseLeave(trigger);
    act(() => {
      jest.advanceTimersByTime(100); // Default hide delay
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // Focus behavior tests
  test('shows tooltip on focus', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    );

    fireEvent.focus(screen.getByText('Focus me'));
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  test('hides tooltip on blur', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Focus me');
    
    // Show tooltip
    fireEvent.focus(trigger);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Hide tooltip
    fireEvent.blur(trigger);
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // Position tests
  test.each(['top', 'right', 'bottom', 'left'] as const)(
    'renders tooltip in %s position',
    (position) => {
      render(
        <Tooltip content="Test tooltip" position={position}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover me'));
      act(() => {
        jest.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass(`tooltip--${position}`);
    }
  );

  // Theme tests
  test('applies light theme styles correctly', () => {
    render(
      <Tooltip content="Test tooltip" theme={LIGHT_THEME}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({
      '--tooltip-background': LIGHT_THEME.backgroundColor,
      '--tooltip-text': LIGHT_THEME.textColor,
      '--tooltip-border': LIGHT_THEME.borderColor
    });
  });

  test('applies dark theme styles correctly', () => {
    render(
      <Tooltip content="Test tooltip" theme={DARK_THEME}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({
      '--tooltip-background': DARK_THEME.backgroundColor,
      '--tooltip-text': DARK_THEME.textColor,
      '--tooltip-border': DARK_THEME.borderColor
    });
  });

  // Content formatting tests
  test('capitalizes string content', () => {
    render(
      <Tooltip content="test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent('Test tooltip');
  });

  test('renders ReactNode content without modification', () => {
    const content = <span data-testid="custom-content">Custom Content</span>;
    render(
      <Tooltip content={content}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  // Email validation in content
  test('validates email in tooltip content', () => {
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';

    expect(validateEmail(validEmail)).toBe(true);
    expect(validateEmail(invalidEmail)).toBe(false);

    render(
      <Tooltip content={validEmail}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent(validEmail);
  });

  // Custom delay tests
  test('respects custom show and hide delays', () => {
    const showDelay = 500;
    const hideDelay = 300;

    render(
      <Tooltip content="Test tooltip" showDelay={showDelay} hideDelay={hideDelay}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');

    // Test show delay
    fireEvent.mouseEnter(trigger);
    act(() => {
      jest.advanceTimersByTime(showDelay - 100);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Test hide delay
    fireEvent.mouseLeave(trigger);
    act(() => {
      jest.advanceTimersByTime(hideDelay - 100);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});