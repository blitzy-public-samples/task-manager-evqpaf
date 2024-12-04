/**
 * Task Details Component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Implements task-related functionalities such as viewing, updating, and deleting tasks.
 * 
 * Human Tasks:
 * - Verify task status and priority values match backend validation
 * - Ensure proper error handling UI components are in place
 * - Test accessibility of task management controls
 * - Verify task deletion confirmation workflow
 */

// react v18.2.0
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // v6.14.1

// Interfaces and Types
import { TaskInterface, TaskStatus, TaskPriority } from '../../interfaces/task.interface';

// Services and Hooks
import { getTaskById, updateTask, deleteTask } from '../../services/task.service';
import useTask from '../../hooks/useTask';
import useNotification from '../../hooks/useNotification';

// Components
import Notification from '../../components/common/Notification/Notification';
import Loading from '../../components/common/Loading/Loading';

const TaskDetails: React.FC = () => {
  // Get task ID from URL parameters
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // Initialize hooks
  const { 
    selectedTask,
    loading,
    error,
    fetchTaskById,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    clearTaskError
  } = useTask();

  const { triggerNotification } = useNotification();

  // Local state for form handling
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<TaskInterface>>({});

  // Fetch task details on component mount
  useEffect(() => {
    if (taskId) {
      fetchTaskById(taskId);
    }
  }, [taskId, fetchTaskById]);

  // Update form data when selected task changes
  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description,
        status: selectedTask.status,
        priority: selectedTask.priority,
        dueDate: selectedTask.dueDate
      });
    }
  }, [selectedTask]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle task update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !formData) return;

    try {
      await handleUpdateTask(taskId, formData);
      setIsEditing(false);
      triggerNotification({
        message: 'Task updated successfully',
        type: 'success'
      });
    } catch (error) {
      triggerNotification({
        message: error instanceof Error ? error.message : 'Failed to update task',
        type: 'error'
      });
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (!taskId) return;

    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    try {
      await handleDeleteTask(taskId);
      triggerNotification({
        message: 'Task deleted successfully',
        type: 'success'
      });
      navigate('/tasks');
    } catch (error) {
      triggerNotification({
        message: error instanceof Error ? error.message : 'Failed to delete task',
        type: 'error'
      });
    }
  };

  // Show loading state
  if (loading) {
    return <Loading isLoading={true} message="Loading task details..." />;
  }

  // Show error state
  if (error) {
    return (
      <Notification
        message={error}
        type="error"
        actions={[{
          label: 'Try Again',
          onClick: () => {
            clearTaskError();
            if (taskId) fetchTaskById(taskId);
          }
        }]}
      />
    );
  }

  // Show not found state
  if (!selectedTask) {
    return (
      <Notification
        message="Task not found"
        type="error"
        actions={[{
          label: 'Go Back',
          onClick: () => navigate('/tasks')
        }]}
      />
    );
  }

  return (
    <div className="task-details" data-testid="task-details">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status || ''}
              onChange={handleInputChange}
              required
            >
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority || ''}
              onChange={handleInputChange}
              required
            >
              {Object.values(TaskPriority).map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="task-view">
          <div className="task-header">
            <h1>{selectedTask.title}</h1>
            <div className="task-actions">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
                aria-label="Edit task"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
                aria-label="Delete task"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="task-info">
            <div className="info-group">
              <span className="label">Status:</span>
              <span className={`status-badge status-${selectedTask.status.toLowerCase()}`}>
                {selectedTask.status.replace('_', ' ')}
              </span>
            </div>

            <div className="info-group">
              <span className="label">Priority:</span>
              <span className={`priority-badge priority-${selectedTask.priority.toLowerCase()}`}>
                {selectedTask.priority}
              </span>
            </div>

            <div className="info-group">
              <span className="label">Due Date:</span>
              <span>{new Date(selectedTask.dueDate).toLocaleString()}</span>
            </div>

            <div className="info-group">
              <span className="label">Description:</span>
              <p className="description">{selectedTask.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;