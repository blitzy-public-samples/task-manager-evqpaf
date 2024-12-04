/**
 * Unit and Integration Tests for TaskForm Component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Validates the TaskForm component's ability to create and edit tasks, including form validation
 *   and API interactions.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure error scenarios are properly tested
 * - Update tests when form validation rules change
 */

// @testing-library/react v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from './TaskForm';
import { mockGetTasksHandler, mockCreateTaskHandler } from '../../../tests/mocks/handlers';
import { initializeMockServer } from '../../../tests/mocks/server';
import { validateEmail } from '../../../utils/validation.utils';
import { BASE_API_URL } from '../../../constants/api.constants';
import { ROUTES } from '../../../constants/routes.constants';
import { TaskStatus, TaskPriority } from '../../../interfaces/task.interface';

// Initialize mock server
initializeMockServer();

describe('TaskForm Component', () => {
  // Test form rendering
  describe('Rendering', () => {
    it('should render all form fields correctly', () => {
      render(<TaskForm />);

      // Verify all required form fields are present
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/assignee email/i)).toBeInTheDocument();
    });

    it('should render with initial values when editing a task', () => {
      const initialTask = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date('2024-03-01'),
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        project: { id: 'proj-1', name: 'Test Project' },
        assignee: { id: 'user-1', email: 'test@example.com' }
      };

      render(<TaskForm initialTask={initialTask} />);

      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-03-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue(TaskPriority.HIGH)).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  // Test form validation
  describe('Validation', () => {
    it('should show validation errors for required fields when submitting empty form', async () => {
      render(<TaskForm />);

      // Submit empty form
      fireEvent.click(screen.getByText(/create task/i));

      // Wait for validation messages
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
      });
    });

    it('should validate title length constraints', async () => {
      render(<TaskForm />);

      const titleInput = screen.getByLabelText(/title/i);

      // Test minimum length
      fireEvent.change(titleInput, { target: { value: 'ab' } });
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByText(/minimum length is 3 characters/i)).toBeInTheDocument();
      });

      // Test maximum length
      const longTitle = 'a'.repeat(101);
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByText(/maximum length is 100 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(<TaskForm />);

      const emailInput = screen.getByLabelText(/assignee email/i);

      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
      });
    });
  });

  // Test form submission
  describe('Submission', () => {
    it('should successfully submit valid form data', async () => {
      const onSubmit = jest.fn();
      render(<TaskForm onSubmit={onSubmit} />);

      // Fill out form with valid data
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Task' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test Description that meets minimum length' }
      });
      fireEvent.change(screen.getByLabelText(/due date/i), {
        target: { value: '2024-03-01' }
      });
      fireEvent.change(screen.getByLabelText(/priority/i), {
        target: { value: TaskPriority.MEDIUM }
      });
      fireEvent.change(screen.getByLabelText(/assignee email/i), {
        target: { value: 'test@example.com' }
      });

      // Submit form
      fireEvent.click(screen.getByText(/create task/i));

      // Wait for submission to complete
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should handle API errors during submission', async () => {
      // Mock API error response
      const server = initializeMockServer();
      server.use(
        mockCreateTaskHandler.mockImplementationOnce((req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              message: 'Server error'
            })
          );
        })
      );

      render(<TaskForm />);

      // Fill out and submit form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Task' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test Description that meets minimum length' }
      });
      fireEvent.change(screen.getByLabelText(/due date/i), {
        target: { value: '2024-03-01' }
      });

      fireEvent.click(screen.getByText(/create task/i));

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });
  });

  // Test form cancellation
  describe('Cancellation', () => {
    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = jest.fn();
      render(<TaskForm onCancel={onCancel} />);

      fireEvent.click(screen.getByText(/cancel/i));

      expect(onCancel).toHaveBeenCalled();
    });

    it('should reset form when cancelled', () => {
      render(<TaskForm />);

      // Fill out form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Task' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test Description' }
      });

      // Cancel form
      fireEvent.click(screen.getByText(/cancel/i));

      // Verify form is reset
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });
  });
});