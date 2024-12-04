/**
 * Mock API Handlers for Testing
 * 
 * Requirements Addressed:
 * - Testing Requirements (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
 *   Provides mock handlers to simulate API responses for testing purposes.
 * 
 * Human Tasks:
 * - Verify mock response data matches expected API response formats
 * - Ensure mock handlers cover all required test scenarios
 * - Update mock data when API response structures change
 */

// msw v0.49.3
import { rest } from 'msw';
import { BASE_API_URL } from '../../src/constants/api.constants';
import { makeApiRequest } from '../../src/utils/api.utils';
import { TaskStatus, TaskPriority } from '../../src/interfaces/task.interface';

// Mock task data for testing
const mockTasks = [
  {
    id: '1',
    title: 'Complete API Documentation',
    description: 'Write comprehensive API documentation for all endpoints',
    dueDate: new Date('2024-03-01'),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    project: {
      id: 'proj-1',
      name: 'API Development'
    },
    assignee: {
      id: 'user-1',
      email: 'john.doe@example.com'
    }
  },
  {
    id: '2',
    title: 'Implement User Authentication',
    description: 'Add JWT-based authentication system',
    dueDate: new Date('2024-02-28'),
    status: TaskStatus.TODO,
    priority: TaskPriority.URGENT,
    project: {
      id: 'proj-1',
      name: 'API Development'
    },
    assignee: {
      id: 'user-2',
      email: 'jane.smith@example.com'
    }
  }
];

/**
 * Mock handler for GET /tasks endpoint
 * Simulates retrieving a list of tasks
 */
export const mockGetTasksHandler = rest.get(
  `${BASE_API_URL}/tasks`,
  async (req, res, ctx) => {
    try {
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: mockTasks,
          message: 'Tasks retrieved successfully'
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: 'Failed to retrieve tasks',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      );
    }
  }
);

/**
 * Mock handler for POST /tasks endpoint
 * Simulates creating a new task
 */
export const mockCreateTaskHandler = rest.post(
  `${BASE_API_URL}/tasks`,
  async (req, res, ctx) => {
    try {
      // Validate request payload
      const body = await req.json();
      
      // Simulate validation using makeApiRequest utility
      await makeApiRequest('/tasks/validate', {
        method: 'POST',
        data: body
      });

      // Create new task with mock ID and timestamps
      const newTask = {
        id: `task-${Date.now()}`,
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res(
        ctx.status(201),
        ctx.json({
          success: true,
          data: newTask,
          message: 'Task created successfully'
        })
      );
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error && error.name === 'ApiRequestError') {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            message: 'Invalid task data',
            error: error.message
          })
        );
      }

      // Handle other errors
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: 'Failed to create task',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      );
    }
  }
);