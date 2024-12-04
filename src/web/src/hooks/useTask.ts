/**
 * Custom React Hook for Task Management
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Implements task-related operations such as creation, retrieval, updating, and deletion,
 *   ensuring seamless integration with the frontend and backend.
 * 
 * Human Tasks:
 * - Verify error handling aligns with UI error display components
 * - Ensure proper loading states are handled by UI components
 * - Configure appropriate error tracking for task operations
 */

// react v18.2.0
import { useEffect, useState } from 'react';
// react-redux v8.0.5
import { useDispatch, useSelector } from 'react-redux';

import { TaskInterface } from '../interfaces/task.interface';
import { 
  createTask,
  getTaskById,
  updateTask,
  deleteTask 
} from '../services/task.service';
import { 
  createTaskAsync,
  updateTaskAsync,
  deleteTaskAsync,
  fetchTaskByIdAsync,
  setSelectedTask,
  clearError 
} from '../store/task/task.slice';

interface UseTaskReturn {
  tasks: TaskInterface[];
  selectedTask: TaskInterface | null;
  loading: boolean;
  error: string | null;
  createTask: (taskData: TaskInterface) => Promise<void>;
  updateTask: (taskId: string, taskData: Partial<TaskInterface>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;
  selectTask: (task: TaskInterface | null) => void;
  clearTaskError: () => void;
}

/**
 * Custom hook for managing task-related operations and state
 * Provides a unified interface for task CRUD operations and state management
 * 
 * @returns {UseTaskReturn} Object containing task state and operations
 */
const useTask = (): UseTaskReturn => {
  // Get dispatch function for Redux actions
  const dispatch = useDispatch();

  // Select task-related state from Redux store
  const tasks = useSelector((state: any) => state.task.tasks);
  const selectedTask = useSelector((state: any) => state.task.selectedTask);
  const loading = useSelector((state: any) => state.task.loading);
  const error = useSelector((state: any) => state.task.error);

  /**
   * Creates a new task
   * @param taskData - The task data to create
   */
  const handleCreateTask = async (taskData: TaskInterface): Promise<void> => {
    try {
      await dispatch(createTaskAsync(taskData));
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  /**
   * Updates an existing task
   * @param taskId - The ID of the task to update
   * @param taskData - The partial task data to update
   */
  const handleUpdateTask = async (
    taskId: string,
    taskData: Partial<TaskInterface>
  ): Promise<void> => {
    try {
      await dispatch(updateTaskAsync(taskId, taskData));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  /**
   * Deletes a task
   * @param taskId - The ID of the task to delete
   */
  const handleDeleteTask = async (taskId: string): Promise<void> => {
    try {
      await dispatch(deleteTaskAsync(taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  /**
   * Fetches a task by ID
   * @param taskId - The ID of the task to fetch
   */
  const handleFetchTaskById = async (taskId: string): Promise<void> => {
    try {
      await dispatch(fetchTaskByIdAsync(taskId));
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  };

  /**
   * Sets the selected task in the store
   * @param task - The task to select or null to clear selection
   */
  const handleSelectTask = (task: TaskInterface | null): void => {
    dispatch(setSelectedTask(task));
  };

  /**
   * Clears any task-related errors in the store
   */
  const handleClearError = (): void => {
    dispatch(clearError());
  };

  return {
    tasks,
    selectedTask,
    loading,
    error,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    fetchTaskById: handleFetchTaskById,
    selectTask: handleSelectTask,
    clearTaskError: handleClearError
  };
};

export default useTask;