/**
 * Task Form Component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Provides a user interface for creating and editing tasks, including fields for title,
 *   description, due date, priority, and assignee.
 * 
 * Human Tasks:
 * - Verify form validation messages match UX copy requirements
 * - Ensure form accessibility meets WCAG standards
 * - Configure date picker localization settings
 */

// react v18.2.0
import { useState, useEffect } from 'react';
import { TaskInterface, TaskPriority, TaskStatus } from '../../../interfaces/task.interface';
import useForm from '../../../hooks/useForm';
import useTask from '../../../hooks/useTask';
import { validateEmail } from '../../../utils/validation.utils';
import { makeApiRequest } from '../../../utils/api.utils';

interface TaskFormProps {
  initialTask?: TaskInterface;
  onSubmit?: (task: TaskInterface) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel
}) => {
  // Initialize form with validation rules
  const { values, errors, touched, handleChange, handleBlur, setValues, resetForm, validateForm } = useForm(
    {
      title: initialTask?.title || '',
      description: initialTask?.description || '',
      dueDate: initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : '',
      priority: initialTask?.priority || TaskPriority.MEDIUM,
      assigneeEmail: initialTask?.assignee?.email || ''
    },
    {
      title: { required: true, minLength: 3, maxLength: 100 },
      description: { required: true, minLength: 10, maxLength: 1000 },
      dueDate: { required: true },
      priority: { required: true },
      assigneeEmail: { email: true }
    }
  );

  // Get task management functions from useTask hook
  const { createTask, updateTask, loading, error, clearTaskError } = useTask();

  // Clear any existing errors when component unmounts
  useEffect(() => {
    return () => {
      clearTaskError();
    };
  }, []);

  /**
   * Handles form submission
   * Validates form data and calls appropriate task operation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    try {
      const taskData: Partial<TaskInterface> = {
        title: values.title,
        description: values.description,
        dueDate: new Date(values.dueDate),
        priority: values.priority as TaskPriority,
        status: initialTask?.status || TaskStatus.TODO
      };

      // Add assignee if email is provided
      if (values.assigneeEmail) {
        taskData.assignee = {
          email: values.assigneeEmail,
          id: initialTask?.assignee?.id || ''
        };
      }

      if (initialTask?.id) {
        // Update existing task
        await updateTask(initialTask.id, taskData);
      } else {
        // Create new task
        await createTask(taskData as TaskInterface);
      }

      // Reset form and notify parent
      resetForm();
      onSubmit?.(taskData as TaskInterface);
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  /**
   * Handles form cancellation
   * Resets form and notifies parent
   */
  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="task-form" noValidate>
      {/* Title Field */}
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.title && errors.title ? 'error' : ''}
          placeholder="Enter task title"
          required
        />
        {touched.title && errors.title && (
          <span className="error-message">{errors.title}</span>
        )}
      </div>

      {/* Description Field */}
      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.description && errors.description ? 'error' : ''}
          placeholder="Enter task description"
          required
          rows={4}
        />
        {touched.description && errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      {/* Due Date Field */}
      <div className="form-group">
        <label htmlFor="dueDate">Due Date *</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={values.dueDate}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.dueDate && errors.dueDate ? 'error' : ''}
          required
          min={new Date().toISOString().split('T')[0]}
        />
        {touched.dueDate && errors.dueDate && (
          <span className="error-message">{errors.dueDate}</span>
        )}
      </div>

      {/* Priority Field */}
      <div className="form-group">
        <label htmlFor="priority">Priority *</label>
        <select
          id="priority"
          name="priority"
          value={values.priority}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.priority && errors.priority ? 'error' : ''}
          required
        >
          {Object.values(TaskPriority).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        {touched.priority && errors.priority && (
          <span className="error-message">{errors.priority}</span>
        )}
      </div>

      {/* Assignee Email Field */}
      <div className="form-group">
        <label htmlFor="assigneeEmail">Assignee Email</label>
        <input
          id="assigneeEmail"
          name="assigneeEmail"
          type="email"
          value={values.assigneeEmail}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.assigneeEmail && errors.assigneeEmail ? 'error' : ''}
          placeholder="Enter assignee email"
        />
        {touched.assigneeEmail && errors.assigneeEmail && (
          <span className="error-message">{errors.assigneeEmail}</span>
        )}
      </div>

      {/* Error Display */}
      {error && <div className="form-error">{error}</div>}

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;