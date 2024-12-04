/**
 * Dashboard Component Tests
 * 
 * Requirements Addressed:
 * - Dashboard Testing (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
 *   Ensures the Dashboard page functions correctly by testing its components,
 *   state management, and API integrations.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user flows are tested
 * - Review error handling test cases
 */

// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// react-redux v8.1.0
import { Provider } from 'react-redux';
// react v18.2.0
import React from 'react';

// Internal imports
import Dashboard from './Dashboard';
import { mockGetTasksHandler, mockCreateTaskHandler } from '../../../tests/mocks/handlers';
import { setupTests } from '../../../tests/setup';
import store from '../../../store/store';
import { taskReducer } from '../../../store/task/task.slice';
import { projectReducer } from '../../../store/project/project.slice';
import Loading from '../../../components/common/Loading/Loading';
import Table from '../../../components/common/Table/Table';

// Initialize test environment
setupTests();

// Utility function to render Dashboard with Redux Provider
const renderDashboard = () => {
  return render(
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset store state before each test
    store.dispatch({ type: 'RESET_STATE' });
  });

  describe('Rendering', () => {
    test('should render dashboard header', () => {
      renderDashboard();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('should render projects section', () => {
      renderDashboard();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    test('should render tasks section', () => {
      renderDashboard();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    test('should show loading state while fetching data', () => {
      renderDashboard();
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    test('should fetch and display projects on mount', async () => {
      renderDashboard();
      
      // Verify loading state is shown
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      // Wait for projects to load
      const projectsSection = await screen.findByText('Projects');
      expect(projectsSection).toBeInTheDocument();
    });

    test('should fetch and display tasks on mount', async () => {
      renderDashboard();
      
      // Verify loading state is shown
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      // Wait for tasks to load
      const tasksSection = await screen.findByText('Tasks');
      expect(tasksSection).toBeInTheDocument();
    });

    test('should handle API errors gracefully', async () => {
      // Mock API error response
      mockGetTasksHandler.mockImplementationOnce(() => 
        Promise.reject(new Error('Failed to fetch data'))
      );

      renderDashboard();
      
      // Wait for error message
      const errorMessage = await screen.findByText(/Error loading dashboard/i);
      expect(errorMessage).toBeInTheDocument();
      
      // Verify retry button is present
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('should handle retry action when data fetch fails', async () => {
      // Mock initial error and subsequent success
      mockGetTasksHandler
        .mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch data')))
        .mockImplementationOnce(() => Promise.resolve({ data: [] }));

      renderDashboard();
      
      // Wait for error state
      const retryButton = await screen.findByText('Retry');
      
      // Click retry button
      fireEvent.click(retryButton);
      
      // Verify loading state is shown again
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      // Verify data is loaded successfully
      const dashboard = await screen.findByText('Dashboard');
      expect(dashboard).toBeInTheDocument();
    });

    test('should update projects when new data is received', async () => {
      renderDashboard();
      
      // Simulate new project data
      store.dispatch({
        type: 'project/setProjects',
        payload: [{
          id: '1',
          name: 'Test Project',
          description: 'Test Description',
          status: 'active'
        }]
      });
      
      // Verify new project is displayed
      const projectName = await screen.findByText('Test Project');
      expect(projectName).toBeInTheDocument();
    });

    test('should update tasks when new data is received', async () => {
      renderDashboard();
      
      // Simulate new task data
      store.dispatch({
        type: 'task/setTasks',
        payload: [{
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo'
        }]
      });
      
      // Verify new task is displayed
      const taskTitle = await screen.findByText('Test Task');
      expect(taskTitle).toBeInTheDocument();
    });
  });

  describe('Layout Responsiveness', () => {
    test('should adjust layout for mobile screens', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      renderDashboard();
      
      const dashboard = screen.getByTestId('dashboard-content');
      expect(dashboard).toHaveStyle({
        gridTemplateColumns: '1fr'
      });
    });

    test('should adjust layout for desktop screens', () => {
      // Mock desktop viewport
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));

      renderDashboard();
      
      const dashboard = screen.getByTestId('dashboard-content');
      expect(dashboard).toHaveStyle({
        gridTemplateColumns: '1fr 1fr'
      });
    });
  });

  describe('Authentication Integration', () => {
    test('should fetch data only when user is authenticated', async () => {
      // Mock authenticated state
      store.dispatch({
        type: 'auth/setUser',
        payload: { id: '1', email: 'test@example.com' }
      });

      renderDashboard();
      
      // Verify data fetching is triggered
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      // Wait for data to load
      const dashboard = await screen.findByText('Dashboard');
      expect(dashboard).toBeInTheDocument();
    });

    test('should not fetch data when user is not authenticated', () => {
      // Mock unauthenticated state
      store.dispatch({
        type: 'auth/clearUser'
      });

      renderDashboard();
      
      // Verify no data fetching is triggered
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });
});