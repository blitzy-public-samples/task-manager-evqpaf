/**
 * Tasks Page Component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Implements task listing, sorting, filtering, and management functionalities to enhance task management capabilities.
 * 
 * Human Tasks:
 * - Verify task filtering and sorting performance with large datasets
 * - Ensure task status updates are properly reflected in real-time
 * - Test task management operations with different user roles
 */

// react v18.2.0
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Internal imports using relative paths
import TaskList from '../../components/task/TaskList/TaskList';
import useTask from '../../hooks/useTask';
import { actions } from '../../store/task/task.slice';
import { TaskInterface } from '../../interfaces/task.interface';

/**
 * Tasks page component that provides task management functionality.
 * Integrates with TaskList component and useTask hook for comprehensive
 * task management capabilities.
 * 
 * @returns {JSX.Element} The rendered Tasks page component
 */
const Tasks: React.FC = () => {
  // Get task-related state and functions from useTask hook
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    selectTask,
    clearTaskError
  } = useTask();

  // Local state for task management
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Redux dispatch
  const dispatch = useDispatch();

  // Clear any task errors when component unmounts
  useEffect(() => {
    return () => {
      clearTaskError();
    };
  }, [clearTaskError]);

  // Handle task selection
  const handleTaskSelect = useCallback((task: TaskInterface) => {
    setSelectedTaskId(task.id);
    selectTask(task);
  }, [selectTask]);

  // Handle task status update
  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<TaskInterface>) => {
    try {
      await updateTask(taskId, updates);
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [updateTask]);

  // Handle task deletion
  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [deleteTask]);

  return (
    <div className="tasks-page">
      <TaskList
        onRowClick={handleTaskSelect}
      />

      <style jsx>{`
        .tasks-page {
          padding: 2rem;
          min-height: 100vh;
          background-color: var(--background-color);
          color: var(--text-color);
        }

        @media (max-width: 768px) {
          .tasks-page {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Tasks;