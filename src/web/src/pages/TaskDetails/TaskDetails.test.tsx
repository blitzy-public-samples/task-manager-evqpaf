/**
 * Unit and Integration Tests for TaskDetails Component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Ensures the TaskDetails component correctly implements task-related functionalities such as viewing,
 *   updating, and deleting tasks.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user flows are tested
 * - Add additional edge case tests as needed
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest v29.0.0
import { jest } from '@jest/globals';

// Component and dependencies
import TaskDetails from './TaskDetails';
import useTask from '../../hooks/useTask';
import { getTaskById } from '../../services/task.service';
import { taskSlice } from '../../store/task/task.slice';
import { makeApiRequest } from '../../utils/api.utils';
import { TaskStatus, TaskPriority } from '../../interfaces/task.interface';

// Mock dependencies
jest.mock('../../hooks/useTask');
jest.mock('../../services/task.service');
jest.mock('../../utils/api.utils');
jest.mock('react-router-dom', () => ({
  useParams: () => ({ taskId: 'test-task-id' }),
  useNavigate: () => jest.fn()
}));

// Mock task data
const mockTask = {
  id: 'test-task-id',
  title: 'Test Task',
  description: 'Test task description',
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.HIGH,
  dueDate: new Date('2024-01-01').toISOString(),
  project: {
    id: 'test-project-id',
    name: 'Test Project'
  },
  assignee: {
    id: 'test-user-id',
    email: 'test@example.com'
  }
};

describe('TaskDetails Component', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock useTask hook implementation
    (useTask as jest.Mock).mockImplementation(() => ({
      selectedTask: mockTask,
      loading: false,
      error: null,
      fetchTaskById: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      clearTaskError: jest.fn()
    }));
  });

  describe('Rendering', () => {
    it('renders task details correctly', () => {
      render(<TaskDetails />);

      // Verify task information is displayed
      expect(screen.getByText(mockTask.title)).toBeInTheDocument();
      expect(screen.getByText(mockTask.description)).toBeInTheDocument();
      expect(screen.getByText(mockTask.status.replace('_', ' '))).toBeInTheDocument();
      expect(screen.getByText(mockTask.priority)).toBeInTheDocument();
      expect(screen.getByText(new Date(mockTask.dueDate).toLocaleString())).toBeInTheDocument();
    });

    it('renders loading state correctly', () => {
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: null,
        loading: true,
        error: null,
        fetchTaskById: jest.fn()
      }));

      render(<TaskDetails />);
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
      const errorMessage = 'Failed to load task';
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: null,
        loading: false,
        error: errorMessage,
        fetchTaskById: jest.fn(),
        clearTaskError: jest.fn()
      }));

      render(<TaskDetails />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders not found state correctly', () => {
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: null,
        loading: false,
        error: null,
        fetchTaskById: jest.fn()
      }));

      render(<TaskDetails />);
      expect(screen.getByText('Task not found')).toBeInTheDocument();
    });
  });

  describe('Task Updates', () => {
    it('handles task update correctly', async () => {
      const updateTask = jest.fn().mockResolvedValue(mockTask);
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: mockTask,
        loading: false,
        error: null,
        updateTask,
        fetchTaskById: jest.fn()
      }));

      render(<TaskDetails />);

      // Click edit button
      fireEvent.click(screen.getByText('Edit'));

      // Update task title
      const titleInput = screen.getByLabelText('Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Task Title' } });

      // Submit form
      fireEvent.submit(screen.getByRole('form'));

      // Verify update was called with correct data
      expect(updateTask).toHaveBeenCalledWith('test-task-id', expect.objectContaining({
        title: 'Updated Task Title'
      }));
    });

    it('validates required fields on update', () => {
      render(<TaskDetails />);

      // Click edit button
      fireEvent.click(screen.getByText('Edit'));

      // Clear required field
      const titleInput = screen.getByLabelText('Title');
      fireEvent.change(titleInput, { target: { value: '' } });

      // Submit form
      fireEvent.submit(screen.getByRole('form'));

      // Verify form validation
      expect(titleInput).toBeInvalid();
    });
  });

  describe('Task Deletion', () => {
    it('handles task deletion correctly', async () => {
      const deleteTask = jest.fn().mockResolvedValue(undefined);
      const navigate = jest.fn();
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: mockTask,
        loading: false,
        error: null,
        deleteTask,
        fetchTaskById: jest.fn()
      }));

      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm');
      confirmSpy.mockImplementation(() => true);

      render(<TaskDetails />);

      // Click delete button
      fireEvent.click(screen.getByText('Delete'));

      // Verify confirmation was shown
      expect(confirmSpy).toHaveBeenCalled();

      // Verify delete was called
      expect(deleteTask).toHaveBeenCalledWith('test-task-id');

      confirmSpy.mockRestore();
    });

    it('cancels task deletion when user declines confirmation', () => {
      const deleteTask = jest.fn();
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: mockTask,
        loading: false,
        error: null,
        deleteTask,
        fetchTaskById: jest.fn()
      }));

      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm');
      confirmSpy.mockImplementation(() => false);

      render(<TaskDetails />);

      // Click delete button
      fireEvent.click(screen.getByText('Delete'));

      // Verify delete was not called
      expect(deleteTask).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('handles update errors correctly', async () => {
      const errorMessage = 'Failed to update task';
      const updateTask = jest.fn().mockRejectedValue(new Error(errorMessage));
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: mockTask,
        loading: false,
        error: null,
        updateTask,
        fetchTaskById: jest.fn()
      }));

      render(<TaskDetails />);

      // Click edit button
      fireEvent.click(screen.getByText('Edit'));

      // Submit form
      fireEvent.submit(screen.getByRole('form'));

      // Verify error handling
      expect(updateTask).toHaveBeenCalled();
      // Wait for error notification
      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it('handles delete errors correctly', async () => {
      const errorMessage = 'Failed to delete task';
      const deleteTask = jest.fn().mockRejectedValue(new Error(errorMessage));
      (useTask as jest.Mock).mockImplementation(() => ({
        selectedTask: mockTask,
        loading: false,
        error: null,
        deleteTask,
        fetchTaskById: jest.fn()
      }));

      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm');
      confirmSpy.mockImplementation(() => true);

      render(<TaskDetails />);

      // Click delete button
      fireEvent.click(screen.getByText('Delete'));

      // Verify error handling
      expect(deleteTask).toHaveBeenCalled();
      // Wait for error notification
      expect(await screen.findByText(errorMessage)).toBeInTheDocument();

      confirmSpy.mockRestore();
    });
  });
});