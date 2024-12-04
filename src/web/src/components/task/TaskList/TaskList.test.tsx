// @testing-library/react v14.0.0
import { render, screen, fireEvent, within } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// react v18.2.0
import React from 'react';

// Internal imports
import TaskList from './TaskList';
import { TaskInterface, TaskStatus, TaskPriority } from '../../../interfaces/task.interface';
import useTask from '../../../hooks/useTask';
import { taskSlice } from '../../../store/task/task.slice';

// Mock the useTask hook
jest.mock('../../../hooks/useTask');

// Mock task data for testing
const mockTasks: TaskInterface[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    dueDate: new Date('2024-01-01'),
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    project: { id: 'p1', name: 'Project 1' },
    assignee: { id: 'u1', email: 'user1@example.com' }
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    dueDate: new Date('2024-01-02'),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    project: { id: 'p1', name: 'Project 1' },
    assignee: { id: 'u2', email: 'user2@example.com' }
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description 3',
    dueDate: new Date('2024-01-03'),
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    project: { id: 'p2', name: 'Project 2' },
    assignee: { id: 'u3', email: 'user3@example.com' }
  }
];

describe('TaskList Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useTask as jest.Mock).mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      selectTask: jest.fn()
    });
  });

  /**
   * Test: Component renders correctly with tasks
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('renders task list with provided tasks', () => {
    render(<TaskList />);

    // Verify all tasks are rendered
    mockTasks.forEach(task => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
      expect(screen.getByText(task.description)).toBeInTheDocument();
      expect(screen.getByText(task.status.replace('_', ' '))).toBeInTheDocument();
      expect(screen.getByText(task.priority)).toBeInTheDocument();
    });
  });

  /**
   * Test: Loading state is displayed correctly
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('displays loading state when fetching tasks', () => {
    (useTask as jest.Mock).mockReturnValue({
      tasks: [],
      loading: true,
      error: null,
      selectTask: jest.fn()
    });

    render(<TaskList />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  /**
   * Test: Error state is displayed correctly
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('displays error message when task fetching fails', () => {
    const errorMessage = 'Failed to fetch tasks';
    (useTask as jest.Mock).mockReturnValue({
      tasks: [],
      loading: false,
      error: errorMessage,
      selectTask: jest.fn()
    });

    render(<TaskList />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  /**
   * Test: Task sorting functionality
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('handles sorting tasks by different columns', () => {
    render(<TaskList />);

    // Test sorting by title
    const titleHeader = screen.getByText('Title');
    fireEvent.click(titleHeader);

    // Verify sort order (ascending)
    const rows = screen.getAllByRole('row');
    const firstRow = within(rows[1]).getByText('Task 1');
    const lastRow = within(rows[3]).getByText('Task 3');
    expect(firstRow).toBeInTheDocument();
    expect(lastRow).toBeInTheDocument();

    // Test reverse sort (descending)
    fireEvent.click(titleHeader);
    const rowsAfterSort = screen.getAllByRole('row');
    expect(within(rowsAfterSort[1]).getByText('Task 3')).toBeInTheDocument();
    expect(within(rowsAfterSort[3]).getByText('Task 1')).toBeInTheDocument();
  });

  /**
   * Test: Task selection functionality
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('handles task selection on row click', () => {
    const selectTask = jest.fn();
    (useTask as jest.Mock).mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      selectTask
    });

    render(<TaskList />);

    // Click on a task row
    const taskRow = screen.getByText('Task 1').closest('tr');
    fireEvent.click(taskRow!);

    // Verify selectTask was called with the correct task
    expect(selectTask).toHaveBeenCalledWith(mockTasks[0]);
  });

  /**
   * Test: Empty state handling
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('displays empty message when no tasks are available', () => {
    (useTask as jest.Mock).mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      selectTask: jest.fn()
    });

    render(<TaskList />);
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  /**
   * Test: Status badge rendering
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('renders status badges with correct styling', () => {
    render(<TaskList />);

    mockTasks.forEach(task => {
      const statusBadge = screen.getByText(task.status.replace('_', ' '));
      expect(statusBadge).toHaveClass(`status-badge`);
      expect(statusBadge).toHaveClass(`status-${task.status.toLowerCase()}`);
    });
  });

  /**
   * Test: Priority badge rendering
   * Requirements Addressed:
   * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('renders priority badges with correct styling', () => {
    render(<TaskList />);

    mockTasks.forEach(task => {
      const priorityBadge = screen.getByText(task.priority);
      expect(priorityBadge).toHaveClass(`priority-badge`);
      expect(priorityBadge).toHaveClass(`priority-${task.priority.toLowerCase()}`);
    });
  });
});