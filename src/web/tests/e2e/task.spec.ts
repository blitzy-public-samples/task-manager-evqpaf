/**
 * End-to-End Test Suite for Task Management
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Validates task-related functionalities such as creation, retrieval, updating, and deletion
 *   through E2E tests.
 * 
 * Human Tasks:
 * - Verify test data matches production data format requirements
 * - Ensure all critical task workflows are covered by test cases
 * - Monitor test execution times and optimize if needed
 */

// @jest/globals v29.0.0
import { describe, it, expect } from '@jest/globals';
import { 
  createTask, 
  getTaskById, 
  updateTask, 
  deleteTask 
} from '../../src/services/task.service';
import { 
  mockGetTasksHandler, 
  mockCreateTaskHandler 
} from '../mocks/handlers';
import { initializeMockServer } from '../mocks/server';
import { setupTests } from '../setup';
import { TaskStatus, TaskPriority } from '../../src/interfaces/task.interface';

// Initialize test environment
setupTests();
initializeMockServer();

describe('Task Management E2E Tests', () => {
  // Test data
  const mockTask = {
    title: 'Implement User Authentication',
    description: 'Add JWT-based authentication system',
    dueDate: new Date('2024-02-28'),
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    project: {
      id: 'proj-1',
      name: 'API Development'
    },
    assignee: {
      id: 'user-1',
      email: 'john.doe@example.com'
    }
  };

  it('should create a new task successfully', async () => {
    // Attempt to create a new task
    const createdTask = await createTask(mockTask);

    // Verify the created task has all required properties
    expect(createdTask).toBeDefined();
    expect(createdTask.id).toBeDefined();
    expect(createdTask.title).toBe(mockTask.title);
    expect(createdTask.description).toBe(mockTask.description);
    expect(createdTask.status).toBe(mockTask.status);
    expect(createdTask.priority).toBe(mockTask.priority);
    expect(createdTask.project.id).toBe(mockTask.project.id);
    expect(createdTask.assignee.email).toBe(mockTask.assignee.email);
  });

  it('should retrieve a task by ID', async () => {
    // First create a task to retrieve
    const createdTask = await createTask(mockTask);
    
    // Attempt to retrieve the task
    const retrievedTask = await getTaskById(createdTask.id);

    // Verify the retrieved task matches the created task
    expect(retrievedTask).toBeDefined();
    expect(retrievedTask.id).toBe(createdTask.id);
    expect(retrievedTask.title).toBe(createdTask.title);
    expect(retrievedTask.description).toBe(createdTask.description);
    expect(retrievedTask.status).toBe(createdTask.status);
    expect(retrievedTask.priority).toBe(createdTask.priority);
  });

  it('should update an existing task', async () => {
    // First create a task to update
    const createdTask = await createTask(mockTask);

    // Update data
    const updateData = {
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      description: 'Updated description for authentication system'
    };

    // Attempt to update the task
    const updatedTask = await updateTask(createdTask.id, updateData);

    // Verify the task was updated correctly
    expect(updatedTask).toBeDefined();
    expect(updatedTask.id).toBe(createdTask.id);
    expect(updatedTask.status).toBe(updateData.status);
    expect(updatedTask.priority).toBe(updateData.priority);
    expect(updatedTask.description).toBe(updateData.description);
    // Verify unchanged fields remain the same
    expect(updatedTask.title).toBe(createdTask.title);
    expect(updatedTask.project.id).toBe(createdTask.project.id);
    expect(updatedTask.assignee.email).toBe(createdTask.assignee.email);
  });

  it('should delete a task successfully', async () => {
    // First create a task to delete
    const createdTask = await createTask(mockTask);

    // Attempt to delete the task
    await deleteTask(createdTask.id);

    // Verify the task no longer exists
    try {
      await getTaskById(createdTask.id);
      fail('Expected task to be deleted');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('not found');
    }
  });

  it('should handle invalid task creation data', async () => {
    // Attempt to create a task with invalid data
    const invalidTask = {
      ...mockTask,
      title: '', // Empty title should fail validation
      status: 'INVALID_STATUS' as TaskStatus
    };

    try {
      await createTask(invalidTask);
      fail('Expected task creation to fail');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('Task title is required');
    }
  });

  it('should handle invalid task updates', async () => {
    // First create a valid task
    const createdTask = await createTask(mockTask);

    // Attempt to update with invalid data
    const invalidUpdate = {
      status: 'INVALID_STATUS' as TaskStatus,
      priority: 'INVALID_PRIORITY' as TaskPriority
    };

    try {
      await updateTask(createdTask.id, invalidUpdate);
      fail('Expected task update to fail');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid task status');
    }
  });

  it('should handle non-existent task operations', async () => {
    const nonExistentId = 'non-existent-id';

    // Attempt to retrieve non-existent task
    try {
      await getTaskById(nonExistentId);
      fail('Expected task retrieval to fail');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('not found');
    }

    // Attempt to update non-existent task
    try {
      await updateTask(nonExistentId, { status: TaskStatus.COMPLETED });
      fail('Expected task update to fail');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('not found');
    }

    // Attempt to delete non-existent task
    try {
      await deleteTask(nonExistentId);
      fail('Expected task deletion to fail');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('not found');
    }
  });
});