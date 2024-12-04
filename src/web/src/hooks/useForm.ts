/**
 * Custom React Hook for Form Management
 * 
 * Requirements Addressed:
 * - Input Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures consistent and reusable validation utilities for user inputs, enhancing data integrity 
 *   and user experience.
 * 
 * Human Tasks:
 * - Verify validation error messages match UX copy requirements
 * - Ensure form reset behavior aligns with expected user interactions
 * - Confirm validation timing meets performance requirements
 */

// react v18.2.0
import { useState, useEffect } from 'react';
import { validateEmail, validatePassword } from '../utils/validation.utils';
import { CommonStatus } from '../types/common.types';
import useNotification from './useNotification';

interface FormErrors {
  [key: string]: string;
}

interface FormState {
  values: { [key: string]: any };
  errors: FormErrors;
  touched: { [key: string]: boolean };
  isValid: boolean;
  isDirty: boolean;
}

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    email?: boolean;
    password?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
}

/**
 * Custom hook for managing form state and validation
 * 
 * @param initialValues - Initial form values
 * @param validationRules - Optional validation rules for form fields
 * @returns Form state and management methods
 */
const useForm = (
  initialValues: { [key: string]: any },
  validationRules: ValidationRules = {}
) => {
  const { triggerNotification } = useNotification();

  // Initialize form state
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false
  });

  /**
   * Validates a single form field
   * 
   * @param name - Field name
   * @param value - Field value
   * @returns Validation error message or empty string
   */
  const validateField = (name: string, value: any): string => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Required field validation
    if (rules.required && !value) {
      return `${name} is required`;
    }

    // Email validation
    if (rules.email && !validateEmail(value)) {
      return 'Invalid email address';
    }

    // Password validation
    if (rules.password && !validatePassword(value)) {
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      return 'Invalid value';
    }

    return '';
  };

  /**
   * Validates all form fields
   * 
   * @returns Object containing validation errors
   */
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    let hasErrors = false;

    Object.keys(formState.values).forEach(fieldName => {
      const error = validateField(fieldName, formState.values[fieldName]);
      if (error) {
        errors[fieldName] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      triggerNotification({
        message: 'Please correct the form errors',
        type: 'error',
        duration: 5000
      });
    }

    return errors;
  };

  /**
   * Handles form field changes
   * 
   * @param event - Change event from form field
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = event.target;

    setFormState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        [name]: value
      },
      touched: {
        ...prevState.touched,
        [name]: true
      },
      isDirty: true
    }));
  };

  /**
   * Handles form field blur events
   * 
   * @param event - Blur event from form field
   */
  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name } = event.target;
    const error = validateField(name, formState.values[name]);

    setFormState(prevState => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [name]: error
      },
      touched: {
        ...prevState.touched,
        [name]: true
      }
    }));
  };

  /**
   * Resets form to initial state
   */
  const resetForm = (): void => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false
    });
  };

  /**
   * Sets form values programmatically
   * 
   * @param values - New form values
   */
  const setValues = (values: { [key: string]: any }): void => {
    setFormState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        ...values
      },
      isDirty: true
    }));
  };

  // Validate form when values change
  useEffect(() => {
    const errors = validateForm();
    const isValid = Object.keys(errors).length === 0;

    setFormState(prevState => ({
      ...prevState,
      errors,
      isValid
    }));
  }, [formState.values]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    handleChange,
    handleBlur,
    resetForm,
    setValues,
    validateForm
  };
};

export default useForm;