// jest v29.0.0
// sinon v15.0.0

import { TaskService } from '../../src/services/task.service';
import { TaskRepository } from '../../src/repositories/task.repository';
import { validateTask } from '../../src/validators/task.validator';
import { handleError } from '../../../shared/utils/error-handler';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import sinon from 'sinon';

/**
 * Unit tests for TaskService class
 * 
 * Requirements Addressed:
 * - Task Management Unit Testing (Technical Specification/System Design/Testing Requirements)
 *   Validates the functionality of the TaskService class and its interactions with the repository and validators.
 */

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: TaskRepository;
  let mockTask: any;
  let mockPaginatedResult: any;

  beforeEach(() => {
    // Initialize mocks and stubs
    taskRepository = {
      create: sinon.stub(),
      findById: sinon.stub(),
      update: sinon.stub(),
      delete: sinon.stub(),
      findAll: sinon.stub()
    } as any;

    taskService = new TaskService(taskRepository);

    // Mock task data
    mockTask = {
      id: '123',
      title: 'Test Task',
      description: 'Test Description',
      dueDate: new Date('2024-12-31'),
      assigneeId: 'user123',
      status: 'todo',
      priority: 3
    };

    // Mock paginated result
    mockPaginatedResult = {
      items: [mockTask],
      total: 1,
      page: 1,
      pageSize: 10
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createTask', () => {
    it('should successfully create a task', async () => {
      // Arrange
      taskRepository.create.resolves(mockTask);

      // Act
      const result = await taskService.create(mockTask);

      // Assert
      expect(result).toEqual(mockTask);
      expect(taskRepository.create.calledOnceWith(mockTask)).toBeTruthy();
    });

    it('should throw error when task validation fails', async () => {
      // Arrange
      const invalidTask = { ...mockTask, title: '' };
      const validationError = {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Task validation failed',
        details: 'Invalid title'
      };

      // Act & Assert
      await expect(taskService.create(invalidTask)).rejects.toThrow();
    });
  });

  describe('getTaskById', () => {
    it('should successfully retrieve a task by id', async () => {
      // Arrange
      taskRepository.findById.resolves(mockTask);

      // Act
      const result = await taskService.findById('123');

      // Assert
      expect(result).toEqual(mockTask);
      expect(taskRepository.findById.calledOnceWith('123')).toBeTruthy();
    });

    it('should return null when task is not found', async () => {
      // Arrange
      taskRepository.findById.resolves(null);

      // Act
      const result = await taskService.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
      expect(taskRepository.findById.calledOnceWith('nonexistent')).toBeTruthy();
    });
  });

  describe('updateTask', () => {
    it('should successfully update a task', async () => {
      // Arrange
      const updates = { title: 'Updated Title', priority: 4 };
      const updatedTask = { ...mockTask, ...updates };
      taskRepository.findById.resolves(mockTask);
      taskRepository.update.resolves(updatedTask);

      // Act
      const result = await taskService.update('123', updates);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(taskRepository.update.calledOnceWith('123', updates)).toBeTruthy();
    });

    it('should throw error when updating non-existent task', async () => {
      // Arrange
      taskRepository.findById.resolves(null);
      const updates = { title: 'Updated Title' };

      // Act & Assert
      await expect(taskService.update('nonexistent', updates))
        .rejects
        .toThrow('Task not found: nonexistent');
    });

    it('should throw error when update validation fails', async () => {
      // Arrange
      taskRepository.findById.resolves(mockTask);
      const invalidUpdates = { priority: 10 }; // Invalid priority value

      // Act & Assert
      await expect(taskService.update('123', invalidUpdates)).rejects.toThrow();
    });
  });

  describe('deleteTask', () => {
    it('should successfully delete a task', async () => {
      // Arrange
      taskRepository.findById.resolves(mockTask);
      taskRepository.delete.resolves(true);

      // Act
      const result = await taskService.delete('123');

      // Assert
      expect(result).toBeTruthy();
      expect(taskRepository.delete.calledOnceWith('123')).toBeTruthy();
    });

    it('should throw error when deleting non-existent task', async () => {
      // Arrange
      taskRepository.findById.resolves(null);

      // Act & Assert
      await expect(taskService.delete('nonexistent'))
        .rejects
        .toThrow('Task not found: nonexistent');
    });
  });

  describe('listTasks', () => {
    it('should successfully retrieve paginated tasks', async () => {
      // Arrange
      taskRepository.findAll.resolves(mockPaginatedResult);

      // Act
      const result = await taskService.findAll(1, 10);

      // Assert
      expect(result).toEqual(mockPaginatedResult);
      expect(taskRepository.findAll.calledOnceWith(1, 10)).toBeTruthy();
    });

    it('should throw error when page number is invalid', async () => {
      // Act & Assert
      await expect(taskService.findAll(0, 10))
        .rejects
        .toThrow('Page must be greater than 0');
    });

    it('should throw error when page size is invalid', async () => {
      // Act & Assert
      await expect(taskService.findAll(1, 0))
        .rejects
        .toThrow('Page size must be greater than 0');
    });
  });

  describe('error handling', () => {
    it('should handle repository errors appropriately', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      taskRepository.create.rejects(dbError);

      // Act & Assert
      await expect(taskService.create(mockTask))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should handle validation errors with correct status code', async () => {
      // Arrange
      const invalidTask = { ...mockTask, priority: 10 };

      // Act & Assert
      try {
        await taskService.create(invalidTask);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(error.statusCode).toBe(STATUS_CODES.BAD_REQUEST);
      }
    });
  });
});