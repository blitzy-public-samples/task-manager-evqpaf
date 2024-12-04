/**
 * Task List Component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Implements task listing with sorting, filtering, and loading states to enhance task management capabilities.
 * 
 * Human Tasks:
 * - Verify table column configuration matches design requirements
 * - Ensure task status and priority values are properly displayed
 * - Test sorting and filtering performance with large datasets
 */

// react v18.2.0
import React, { useCallback, useMemo } from 'react';

// Internal imports using relative paths
import { TaskInterface, TaskStatus, TaskPriority } from '../../../interfaces/task.interface';
import useTask from '../../../hooks/useTask';
import Table from '../../common/Table/Table';
import Loading from '../../common/Loading/Loading';

/**
 * TaskList component for displaying tasks in a tabular format with sorting and filtering capabilities.
 * 
 * @returns JSX.Element The rendered task list component
 */
const TaskList: React.FC = () => {
  // Get task-related state and functions from useTask hook
  const { tasks, loading, error, selectTask } = useTask();

  // Define table columns with sorting and formatting
  const columns = useMemo(() => [
    {
      key: 'title',
      label: 'Title',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      formatter: (value: string) => value.length > 100 ? `${value.substring(0, 97)}...` : value
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      formatter: (value: Date) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      formatter: (value: TaskStatus) => (
        <span className={`status-badge status-${value.toLowerCase()}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      formatter: (value: TaskPriority) => (
        <span className={`priority-badge priority-${value.toLowerCase()}`}>
          {value}
        </span>
      )
    }
  ], []);

  // Handle row click to select a task
  const handleRowClick = useCallback((task: TaskInterface) => {
    selectTask(task);
  }, [selectTask]);

  // Show loading state while fetching tasks
  if (loading) {
    return <Loading isLoading={true} message="Loading tasks..." />;
  }

  // Show error state if task fetching failed
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <Table
        columns={columns}
        data={tasks}
        onRowClick={handleRowClick}
        sortable={true}
        loading={loading}
        emptyMessage="No tasks found"
        pageSize={10}
      />

      <style jsx>{`
        .task-list {
          width: 100%;
          padding: 1rem;
          background-color: var(--background-color);
        }

        .error-container {
          padding: 1rem;
          text-align: center;
        }

        .error-message {
          color: var(--error-color);
          font-size: 1rem;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-todo {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .status-in_progress {
          background-color: #fff3e0;
          color: #f57c00;
        }

        .status-review {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        .status-completed {
          background-color: #e8eaf6;
          color: #3f51b5;
        }

        .status-blocked {
          background-color: #ffebee;
          color: #d32f2f;
        }

        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .priority-low {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        .priority-medium {
          background-color: #fff3e0;
          color: #f57c00;
        }

        .priority-high {
          background-color: #fff8e1;
          color: #ffa000;
        }

        .priority-urgent {
          background-color: #ffebee;
          color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default TaskList;