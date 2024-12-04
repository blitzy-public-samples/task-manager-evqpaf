/**
 * Task Service Implementation
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Implements task-related functionalities such as creation, assignment, priority and status tracking,
 *   and due date management.
 * 
 * Human Tasks:
 * - Verify API endpoint configurations match backend routes
 * - Ensure error handling aligns with frontend error display requirements
 * - Configure appropriate request timeouts based on API performance metrics
 */

// axios v1.4.0
import { TaskInterface, TaskStatus, TaskPriority } from '../interfaces/task.interface';
import { BASE_API_URL } from '../constants/api.constants';
import { makeApiRequest } from '../utils/api.utils';
import { validateEmail } from '../utils/validation.utils';

/**
 * Creates a new task by sending a POST request to the task API endpoint.
 * 
 * @param taskData - The task data to create
 * @returns Promise resolving to the created task object
 * @throws ApiRequestError if the request fails or validation fails
 */
export async function createTask(taskData: TaskInterface): Promise<TaskInterface> {
  // Validate required task fields
  if (!taskData.title?.trim()) {
    throw new Error('Task title is required');
  }

  if (!taskData.description?.trim()) {
    throw new Error('Task description is required');
  }

  if (!taskData.dueDate) {
    throw new Error('Due date is required');
  }

  // Validate task status
  if (!Object.values(TaskStatus).includes(taskData.status as TaskStatus)) {
    throw new Error('Invalid task status');
  }

  // Validate task priority
  if (!Object.values(TaskPriority).includes(taskData.priority as TaskPriority)) {
    throw new Error('Invalid task priority');
  }

  // Validate assignee email if present
  if (taskData.assignee?.email && !validateEmail(taskData.assignee.email)) {
    throw new Error('Invalid assignee email format');
  }

  // Make API request to create task
  const response = await makeApiRequest('/tasks', {
    method: 'POST',
    data: taskData
  });

  return response;
}

/**
 * Retrieves a task by its ID from the task API endpoint.
 * 
 * @param taskId - The ID of the task to retrieve
 * @returns Promise resolving to the retrieved task object
 * @throws ApiRequestError if the request fails or task is not found
 */
export async function getTaskById(taskId: string): Promise<TaskInterface> {
  if (!taskId?.trim()) {
    throw new Error('Task ID is required');
  }

  const response = await makeApiRequest(`/tasks/${taskId}`, {
    method: 'GET'
  });

  return response;
}

/**
 * Updates an existing task by sending a PUT request to the task API endpoint.
 * 
 * @param taskId - The ID of the task to update
 * @param taskData - The partial task data to update
 * @returns Promise resolving to the updated task object
 * @throws ApiRequestError if the request fails or validation fails
 */
export async function updateTask(
  taskId: string, 
  taskData: Partial<TaskInterface>
): Promise<TaskInterface> {
  if (!taskId?.trim()) {
    throw new Error('Task ID is required');
  }

  // Validate task status if provided
  if (taskData.status && !Object.values(TaskStatus).includes(taskData.status as TaskStatus)) {
    throw new Error('Invalid task status');
  }

  // Validate task priority if provided
  if (taskData.priority && !Object.values(TaskPriority).includes(taskData.priority as TaskPriority)) {
    throw new Error('Invalid task priority');
  }

  // Validate assignee email if provided
  if (taskData.assignee?.email && !validateEmail(taskData.assignee.email)) {
    throw new Error('Invalid assignee email format');
  }

  const response = await makeApiRequest(`/tasks/${taskId}`, {
    method: 'PUT',
    data: taskData
  });

  return response;
}

/**
 * Deletes a task by sending a DELETE request to the task API endpoint.
 * 
 * @param taskId - The ID of the task to delete
 * @returns Promise resolving when the task is successfully deleted
 * @throws ApiRequestError if the request fails or task is not found
 */
export async function deleteTask(taskId: string): Promise<void> {
  if (!taskId?.trim()) {
    throw new Error('Task ID is required');
  }

  await makeApiRequest(`/tasks/${taskId}`, {
    method: 'DELETE'
  });
}