/**
 * Test suite for the TaskCard component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Ensures the TaskCard component functions correctly, including rendering task details and handling user interactions.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user interactions are tested
 * - Add additional test cases for edge cases if needed
 */

// React v18.2.0
import React from 'react';
// @testing-library/react v13.4.0
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// jest v29.0.0
import { describe, expect, test, jest } from '@jest/globals';

// Internal imports
import { TaskCard } from './TaskCard';
import { TaskInterface, TaskStatus, TaskPriority } from '../../../interfaces/task.interface';
import { mockGetTasksHandler } from '../../../tests/mocks/handlers';
import '../../../tests/setup';

describe('TaskCard Component', () => {
  // Mock task data for testing
  const mockTask: TaskInterface = {
    id: 'task-123',
    title: 'Test Task',
    description: 'This is a test task description that needs to be truncated if it exceeds the maximum length specified in the TaskCard component.',
    dueDate: new Date('2024-03-01'),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    project: {
      id: 'proj-1',
      name: 'Test Project'
    },
    assignee: {
      id: 'user-1',
      email: 'test@example.com'
    }
  };

  // Mock callback functions
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task details correctly', () => {
    render(<TaskCard task={mockTask} />);

    // Verify title is rendered
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();

    // Verify description is rendered and truncated if necessary
    const description = screen.getByText(/This is a test task description/);
    expect(description).toBeInTheDocument();
    expect(description.textContent?.length).toBeLessThanOrEqual(153); // 150 chars + '...'

    // Verify due date is rendered
    expect(screen.getByText(/Due:/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 1, 2024/)).toBeInTheDocument();

    // Verify status is rendered with correct formatting
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  test('handles edit button click correctly', async () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} />);

    // Find and click the edit button
    const editButton = screen.getByRole('button', { name: /Edit task Test Task/i });
    await userEvent.click(editButton);

    // Verify edit callback was called with correct task ID
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask.id);
  });

  test('handles delete button click correctly', async () => {
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} />);

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /Delete task Test Task/i });
    await userEvent.click(deleteButton);

    // Verify delete callback was called with correct task ID
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  test('does not render action buttons when callbacks are not provided', () => {
    render(<TaskCard task={mockTask} />);

    // Verify edit button is not rendered
    expect(screen.queryByRole('button', { name: /Edit task/i })).not.toBeInTheDocument();

    // Verify delete button is not rendered
    expect(screen.queryByRole('button', { name: /Delete task/i })).not.toBeInTheDocument();
  });

  test('renders with different task statuses correctly', () => {
    const statusTests = [
      { status: TaskStatus.TODO, expectedText: 'TODO' },
      { status: TaskStatus.IN_PROGRESS, expectedText: 'IN PROGRESS' },
      { status: TaskStatus.REVIEW, expectedText: 'REVIEW' },
      { status: TaskStatus.COMPLETED, expectedText: 'COMPLETED' },
      { status: TaskStatus.BLOCKED, expectedText: 'BLOCKED' }
    ];

    statusTests.forEach(({ status, expectedText }) => {
      const taskWithStatus = { ...mockTask, status };
      const { rerender } = render(<TaskCard task={taskWithStatus} />);

      // Verify status text is rendered correctly
      expect(screen.getByText(expectedText)).toBeInTheDocument();

      // Clean up before next test
      rerender(<></>);
    });
  });

  test('handles long task titles and descriptions gracefully', () => {
    const longTask = {
      ...mockTask,
      title: 'This is a very long task title that should still be displayed properly without breaking the layout of the card component',
      description: 'This is an extremely long task description that should be truncated at the appropriate length to ensure the card maintains its proper layout and appearance without showing too much text and potentially breaking the design.'
    };

    render(<TaskCard task={longTask} />);

    // Verify title is rendered without breaking layout
    const title = screen.getByText(longTask.title);
    expect(title).toBeInTheDocument();

    // Verify description is truncated
    const description = screen.getByText(/This is an extremely long task description/);
    expect(description).toBeInTheDocument();
    expect(description.textContent?.length).toBeLessThanOrEqual(153); // 150 chars + '...'
  });
});