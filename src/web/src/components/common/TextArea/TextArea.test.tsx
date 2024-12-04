// @testing-library/react@14.0.0
// jest@29.0.0

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TextArea from './TextArea';
import { validateEmail } from '../../../utils/validation.utils';

// Mock validation.utils
jest.mock('../../../utils/validation.utils', () => ({
  validateEmail: jest.fn((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}));

describe('TextArea Component', () => {
  // Common props for testing
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Enter text here',
    id: 'test-textarea'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case: Renders TextArea component correctly
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('renders TextArea component correctly', () => {
    render(<TextArea {...defaultProps} />);
    
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toBeInTheDocument();
    expect(textareaElement).toHaveAttribute('placeholder', 'Enter text here');
    expect(textareaElement).toHaveAttribute('id', 'test-textarea');
  });

  /**
   * Test Case: Validates email input correctly
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('validates email input correctly', async () => {
    render(
      <TextArea
        {...defaultProps}
        validationType="email"
        isRequired={true}
        value="test@example.com"
      />
    );

    const textareaElement = screen.getByRole('textbox');
    
    // Test valid email
    fireEvent.blur(textareaElement);
    expect(validateEmail).toHaveBeenCalledWith('test@example.com');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Test invalid email
    fireEvent.change(textareaElement, { target: { value: 'invalid-email' } });
    fireEvent.blur(textareaElement);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address');
    });
  });

  /**
   * Test Case: Handles onChange event correctly
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('handles onChange event correctly', () => {
    const handleChange = jest.fn();
    render(<TextArea {...defaultProps} onChange={handleChange} />);
    
    const textareaElement = screen.getByRole('textbox');
    fireEvent.change(textareaElement, { target: { value: 'test input' } });
    
    expect(handleChange).toHaveBeenCalledWith('test input');
  });

  /**
   * Test Case: Displays required field error
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('displays required field error when empty', async () => {
    render(
      <TextArea
        {...defaultProps}
        isRequired={true}
        value=""
      />
    );

    const textareaElement = screen.getByRole('textbox');
    fireEvent.blur(textareaElement);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });
  });

  /**
   * Test Case: Respects maxLength constraint
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('respects maxLength constraint', () => {
    const maxLength = 10;
    render(
      <TextArea
        {...defaultProps}
        maxLength={maxLength}
      />
    );

    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toHaveAttribute('maxLength', maxLength.toString());

    // Verify character count display
    fireEvent.change(textareaElement, { target: { value: '12345' } });
    expect(screen.getByText('5/10 characters')).toBeInTheDocument();
  });

  /**
   * Test Case: Handles disabled state correctly
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('handles disabled state correctly', () => {
    render(
      <TextArea
        {...defaultProps}
        disabled={true}
      />
    );

    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toBeDisabled();
  });

  /**
   * Test Case: Displays custom error message
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('displays custom error message', () => {
    const customError = 'Custom error message';
    render(
      <TextArea
        {...defaultProps}
        errorMessage={customError}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(customError);
  });

  /**
   * Test Case: Renders with label correctly
   * Requirements Addressed:
   * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
   */
  it('renders with label correctly', () => {
    const label = 'Test Label';
    render(
      <TextArea
        {...defaultProps}
        label={label}
        isRequired={true}
      />
    );

    const labelElement = screen.getByText(label);
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveTextContent('*');
  });
});