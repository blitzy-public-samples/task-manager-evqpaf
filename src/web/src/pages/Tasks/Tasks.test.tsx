// @testing-library/react v14.0.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// react v18.2.0
import React from 'react';
// redux-mock-store v1.5.4
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

// Internal imports
import Tasks from './Tasks';
import TaskList from '../../components/task/TaskList/TaskList';
import { actions } from '../../store/task/task.slice';
import { makeApiRequest } from '../../utils/api.utils';
import { TaskStatus, TaskPriority } from '../../interfaces/task.interface';

// Mock dependencies
jest.mock('../../components/task/TaskList/TaskList', () => {
  return jest.fn(() => <div data-testid="mock-task-list">TaskList Component</div>);
});

jest.mock('../../utils/api.utils', () => ({
  makeApiRequest: jest.fn()
}));

jest.mock('../../hooks/useTask', () => ({
  __esModule: true,
  default: () => ({
    tasks: mockTasks,
    loading: false,
    error: null,
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    selectTask: jest.fn(),
    clearTaskError: jest.fn()
  })
}));

// Mock data
const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test Description 1',
    dueDate: new Date('2024-01-01'),
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    project: { id: 'p1', name: 'Project 1' },
    assignee: { id: 'u1', email: 'user1@example.com' }
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test Description 2',
    dueDate: new Date('2024-01-02'),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    project: { id: 'p2', name: 'Project 2' },
    assignee: { id: 'u2', email: 'user2@example.com' }
  }
];

// Configure mock store
const mockStore = configureStore([]);
const store = mockStore({
  task: {
    tasks: mockTasks,
    loading: false,
    error: null,
    selectedTask: null
  }
});

describe('Tasks Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  // Test suite for rendering
  describe('Rendering', () => {
    it('renders the Tasks page component without crashing', () => {
      render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );
      
      expect(screen.getByTestId('mock-task-list')).toBeInTheDocument();
    });

    it('applies correct styling to the tasks page container', () => {
      render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );
      
      const container = screen.getByClassName('tasks-page');
      expect(container).toHaveStyle({
        padding: '2rem',
        minHeight: '100vh'
      });
    });
  });

  // Test suite for task list integration
  describe('TaskList Integration', () => {
    it('passes correct props to TaskList component', () => {
      render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );

      expect(TaskList).toHaveBeenCalledWith(
        expect.objectContaining({
          onRowClick: expect.any(Function)
        }),
        expect.any(Object)
      );
    });

    it('handles task selection through TaskList', async () => {
      const { getByTestId } = render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );

      const taskList = getByTestId('mock-task-list');
      fireEvent.click(taskList);

      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: expect.stringContaining('task/setSelectedTask')
            })
          ])
        );
      });
    });
  });

  // Test suite for task operations
  describe('Task Operations', () => {
    it('handles task update correctly', async () => {
      const { getByTestId } = render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );

      const updatedTask = {
        ...mockTasks[0],
        status: TaskStatus.IN_PROGRESS
      };

      (makeApiRequest as jest.Mock).mockResolvedValueOnce(updatedTask);

      // Simulate task update
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: expect.stringContaining('task/updateTaskInState')
            })
          ])
        );
      });
    });

    it('handles task deletion correctly', async () => {
      const { getByTestId } = render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );

      (makeApiRequest as jest.Mock).mockResolvedValueOnce({});

      // Simulate task deletion
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: expect.stringContaining('task/removeTask')
            })
          ])
        );
      });
    });
  });

  // Test suite for error handling
  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const errorMessage = 'Failed to fetch tasks';
      (makeApiRequest as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );

      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: expect.stringContaining('task/fetchTasksFailure'),
              payload: errorMessage
            })
          ])
        );
      });
    });

    it('clears errors when component unmounts', () => {
      const { unmount } = render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );

      unmount();

      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringContaining('task/clearError')
          })
        ])
      );
    });
  });

  // Test suite for responsive design
  describe('Responsive Design', () => {
    it('applies correct styles for mobile viewport', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <Provider store={store}>
          <Tasks />
        </Provider>
      );

      const container = screen.getByClassName('tasks-page');
      expect(container).toHaveStyle({
        padding: '1rem'
      });
    });
  });
});