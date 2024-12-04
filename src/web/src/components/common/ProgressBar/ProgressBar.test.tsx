// External dependencies
// @testing-library/react v14.0.0
import { render, screen } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// react v18.2.0
import React from 'react';

// Internal dependencies
import ProgressBar from './ProgressBar';
import { LIGHT_THEME } from '../../../constants/theme.constants';
import useTheme from '../../../hooks/useTheme';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('ProgressBar Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: LIGHT_THEME,
      toggleTheme: jest.fn()
    }));
  });

  /**
   * Requirements Addressed:
   * - Visual Hierarchy (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
   *   Tests that the progress bar visually represents progress accurately
   */
  it('renders with default props and matches snapshot', () => {
    const { container } = render(<ProgressBar progress={50} />);
    expect(container).toMatchSnapshot();
  });

  it('displays the correct progress value', () => {
    render(<ProgressBar progress={75} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps progress values to valid range (0-100)', () => {
    // Test negative value
    render(<ProgressBar progress={-10} />);
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    // Test value over 100
    render(<ProgressBar progress={110} />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('displays and truncates label correctly', () => {
    const longLabel = 'This is a very long label that should be truncated at fifty characters';
    render(<ProgressBar progress={50} label={longLabel} />);
    
    const label = screen.getByText(/This is a very long label/);
    expect(label).toBeInTheDocument();
    expect(label.textContent?.length).toBeLessThanOrEqual(53); // 50 chars + 3 for ellipsis
  });

  it('applies correct styles based on theme', () => {
    render(<ProgressBar progress={50} theme={LIGHT_THEME} />);
    const progressBarContainer = screen.getByRole('progressbar');
    
    // Check if theme styles are applied
    expect(progressBarContainer).toHaveStyle({
      '--primary-color': LIGHT_THEME.primaryColor,
      '--secondary-color': LIGHT_THEME.secondaryColor,
      '--background-color': LIGHT_THEME.backgroundColor,
      '--text-color': LIGHT_THEME.textColor,
      '--border-color': LIGHT_THEME.borderColor
    });
  });

  it('applies complete state styles at 100% progress', () => {
    render(<ProgressBar progress={100} />);
    const progressBarFill = screen.getByRole('progressbar')
      .querySelector('.progress-bar-fill');
    
    expect(progressBarFill).toHaveClass('complete');
  });

  it('updates styles when theme changes', () => {
    // Mock theme toggle
    const mockToggleTheme = jest.fn();
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: LIGHT_THEME,
      toggleTheme: mockToggleTheme
    }));

    const { rerender } = render(<ProgressBar progress={50} />);
    
    // Change theme
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: {
        ...LIGHT_THEME,
        primaryColor: '#000000' // Changed color
      },
      toggleTheme: mockToggleTheme
    }));

    rerender(<ProgressBar progress={50} />);
    
    const progressBarContainer = screen.getByRole('progressbar');
    expect(progressBarContainer).toHaveStyle({
      '--primary-color': '#000000'
    });
  });

  it('maintains accessibility attributes', () => {
    render(<ProgressBar progress={50} label="Test Progress" />);
    const progressBar = screen.getByRole('progressbar');
    
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-label', 'Test Progress');
  });

  it('renders without label when not provided', () => {
    render(<ProgressBar progress={50} />);
    const label = screen.queryByTestId('progress-bar-label');
    expect(label).not.toBeInTheDocument();
  });

  it('handles decimal progress values correctly', () => {
    render(<ProgressBar progress={33.33} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '33.33');
  });
});