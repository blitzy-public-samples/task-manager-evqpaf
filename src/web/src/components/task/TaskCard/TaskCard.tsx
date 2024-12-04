/**
 * TaskCard Component
 * 
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Provides a UI component for displaying task details such as title, description, due date, and actions.
 * 
 * Human Tasks:
 * - Verify that task status colors match design system specifications
 * - Ensure task description truncation length meets UI requirements
 * - Test component accessibility with screen readers
 */

// React v18.2.0
import React from 'react';

// Internal imports
import { TaskInterface, TaskStatus } from '../../../interfaces/task.interface';
import { formatDate } from '../../../utils/date.utils';
import { truncate } from '../../../utils/string.utils';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';

// Constants
const DESCRIPTION_MAX_LENGTH = 150;
const STATUS_COLORS = {
  [TaskStatus.TODO]: '#757575',
  [TaskStatus.IN_PROGRESS]: '#2196F3',
  [TaskStatus.REVIEW]: '#FFA000',
  [TaskStatus.COMPLETED]: '#4CAF50',
  [TaskStatus.BLOCKED]: '#F44336'
};

interface TaskCardProps {
  task: TaskInterface;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete
}) => {
  const {
    id,
    title,
    description,
    dueDate,
    status
  } = task;

  // Format the due date for display
  const formattedDueDate = formatDate(dueDate);

  // Truncate description if it's too long
  const truncatedDescription = truncate(description, DESCRIPTION_MAX_LENGTH);

  // Handle edit button click
  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  // Render task status with appropriate color
  const renderStatus = () => (
    <span style={{
      color: STATUS_COLORS[status] || STATUS_COLORS[TaskStatus.TODO],
      fontWeight: 500,
      fontSize: '0.875rem'
    }}>
      {status.replace('_', ' ')}
    </span>
  );

  // Render task actions
  const renderActions = () => (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem'
    }}>
      {onEdit && (
        <Button
          label="Edit"
          onClick={handleEdit}
          aria-label={`Edit task ${title}`}
        />
      )}
      {onDelete && (
        <Button
          label="Delete"
          onClick={handleDelete}
          status="INACTIVE"
          aria-label={`Delete task ${title}`}
        />
      )}
    </div>
  );

  return (
    <Card
      title={title}
      status={status}
      className="task-card"
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{
            color: 'var(--text-color)',
            opacity: 0.7,
            fontSize: '0.875rem'
          }}>
            Due: {formattedDueDate}
          </span>
          {renderStatus()}
        </div>

        <p style={{
          margin: 0,
          color: 'var(--text-color)',
          lineHeight: 1.5
        }}>
          {truncatedDescription}
        </p>

        {(onEdit || onDelete) && renderActions()}
      </div>
    </Card>
  );
};

// Default props
TaskCard.defaultProps = {
  onEdit: undefined,
  onDelete: undefined
};