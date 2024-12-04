/**
 * Integration tests for Task Service
 * 
 * Requirements Addressed:
 * - Task Service Integration Testing (Technical Specification/System Design/Testing Strategy)
 *   Ensures that the Task Service interacts correctly with the repository and database layers,
 *   and validates the end-to-end functionality of task-related operations.
 * 
 * Human Tasks:
 * - Configure test database connection settings in environment variables
 * - Set up test data seeding scripts
 * - Configure test coverage thresholds
 * - Set up CI/CD pipeline integration for test execution
 */

// jest v29.0.0
import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect } from '@jest/globals';
import { initializeDatabase } from '../src/config/database.config';
import { TaskRepository } from '../src/repositories/task.repository';
import { TaskService } from '../src/services/task.service';
import { Task, TaskStatus } from '../src/models/task.model';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { ERROR_CODES } from '../../shared/constants/error-codes';

describe('Task Service Integration Tests', () => {
  let dbConnection: any;
  let taskRepository: TaskRepository;
  let taskService: TaskService;
  let testTask: Task;

  beforeAll(async () => {
    // Initialize test database connection
    dbConnection = await initializeDatabase();
    taskRepository = new TaskRepository(dbConnection);
    taskService = new TaskService(taskRepository);
  });

  afterAll(async () => {
    // Close database connection
    await dbConnection.end();
  });

  beforeEach(async () => {
    // Create a test task before each test
    testTask = new Task(
      'test-task-id',
      'Test Task',
      'Test task description',
      new Date(Date.now() + 86400000), // Due tomorrow
      'test-assignee-id',
      TaskStatus.TODO,
      3
    );
  });

  afterEach(async () => {
    // Clean up test data after each test
    await dbConnection.query('DELETE FROM tasks WHERE id = $1', [testTask.id]);
  });

  describe('Task Creation', () => {
    it('should successfully create a new task', async () => {
      // Act
      const createdTask = await taskService.create(testTask);

      // Assert
      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBe(testTask.id);
      expect(createdTask.title).toBe(testTask.title);
      expect(createdTask.status).toBe(TaskStatus.TODO);
    });

    it('should fail to create task with invalid data', async () => {
      // Arrange
      const invalidTask = new Task(
        'invalid-task',
        '', // Invalid empty title
        'Description',
        new Date(),
        'assignee-id',
        TaskStatus.TODO,
        3
      );

      // Act & Assert
      await expect(taskService.create(invalidTask))
        .rejects
        .toThrow('Task title is required');
    });

    it('should fail to create task with past due date', async () => {
      // Arrange
      const pastDueTask = new Task(
        'past-due-task',
        'Past Due Task',
        'Description',
        new Date(Date.now() - 86400000), // Yesterday
        'assignee-id',
        TaskStatus.TODO,
        3
      );

      // Act & Assert
      await expect(taskService.create(pastDueTask))
        .rejects
        .toThrow('Due date cannot be in the past');
    });
  });

  describe('Task Retrieval', () => {
    it('should successfully retrieve a task by ID', async () => {
      // Arrange
      await taskService.create(testTask);

      // Act
      const retrievedTask = await taskService.findById(testTask.id);

      // Assert
      expect(retrievedTask).toBeDefined();
      expect(retrievedTask?.id).toBe(testTask.id);
      expect(retrievedTask?.title).toBe(testTask.title);
    });

    it('should return null for non-existent task ID', async () => {
      // Act
      const result = await taskService.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('should successfully retrieve all tasks with pagination', async () => {
      // Arrange
      await taskService.create(testTask);
      const page = 1;
      const pageSize = 10;

      // Act
      const result = await taskService.findAll(page, pageSize);

      // Assert
      expect(result).toBeDefined();
      expect(result.items).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.page).toBe(page);
      expect(result.pageSize).toBe(pageSize);
    });
  });

  describe('Task Updates', () => {
    it('should successfully update task properties', async () => {
      // Arrange
      await taskService.create(testTask);
      const updates = {
        title: 'Updated Task Title',
        description: 'Updated description',
        priority: 4
      };

      // Act
      const updatedTask = await taskService.update(testTask.id, updates);

      // Assert
      expect(updatedTask).toBeDefined();
      expect(updatedTask.title).toBe(updates.title);
      expect(updatedTask.description).toBe(updates.description);
      expect(updatedTask.priority).toBe(updates.priority);
    });

    it('should successfully update task status', async () => {
      // Arrange
      await taskService.create(testTask);
      const updates = {
        status: TaskStatus.IN_PROGRESS
      };

      // Act
      const updatedTask = await taskService.update(testTask.id, updates);

      // Assert
      expect(updatedTask).toBeDefined();
      expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should fail to update non-existent task', async () => {
      // Arrange
      const updates = {
        title: 'Updated Title'
      };

      // Act & Assert
      await expect(taskService.update('non-existent-id', updates))
        .rejects
        .toThrow('Task not found: non-existent-id');
    });

    it('should fail to update task with invalid data', async () => {
      // Arrange
      await taskService.create(testTask);
      const invalidUpdates = {
        priority: 6 // Invalid priority value
      };

      // Act & Assert
      await expect(taskService.update(testTask.id, invalidUpdates))
        .rejects
        .toThrow('Priority must be between 1 and 5');
    });
  });

  describe('Task Deletion', () => {
    it('should successfully delete a task', async () => {
      // Arrange
      await taskService.create(testTask);

      // Act
      const result = await taskService.delete(testTask.id);

      // Assert
      expect(result).toBe(true);
      const deletedTask = await taskService.findById(testTask.id);
      expect(deletedTask).toBeNull();
    });

    it('should handle deletion of non-existent task', async () => {
      // Act & Assert
      await expect(taskService.delete('non-existent-id'))
        .rejects
        .toThrow('Task not found: non-existent-id');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      await dbConnection.end(); // Force connection closure

      // Act & Assert
      await expect(taskService.findAll(1, 10))
        .rejects
        .toThrow();

      // Cleanup
      dbConnection = await initializeDatabase();
      taskRepository = new TaskRepository(dbConnection);
      taskService = new TaskService(taskRepository);
    });

    it('should handle validation errors with proper error codes', async () => {
      // Arrange
      const invalidTask = new Task(
        'invalid-task',
        'Title',
        'Description',
        new Date(),
        'assignee-id',
        'INVALID_STATUS' as TaskStatus, // Invalid status
        3
      );

      try {
        // Act
        await taskService.create(invalidTask);
        fail('Should have thrown an error');
      } catch (error: any) {
        // Assert
        expect(error.message).toBe('Invalid task status');
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      }
    });
  });

  describe('Task Status Transitions', () => {
    it('should handle valid status transitions', async () => {
      // Arrange
      await taskService.create(testTask);
      const statusTransitions = [
        TaskStatus.IN_PROGRESS,
        TaskStatus.COMPLETED,
        TaskStatus.ARCHIVED
      ];

      // Act & Assert
      for (const status of statusTransitions) {
        const updatedTask = await taskService.update(testTask.id, { status });
        expect(updatedTask.status).toBe(status);
      }
    });

    it('should prevent invalid status transitions from archived', async () => {
      // Arrange
      await taskService.create(testTask);
      await taskService.update(testTask.id, { status: TaskStatus.ARCHIVED });

      // Act & Assert
      await expect(taskService.update(testTask.id, { status: TaskStatus.IN_PROGRESS }))
        .rejects
        .toThrow('Cannot change status of archived task');
    });
  });
});