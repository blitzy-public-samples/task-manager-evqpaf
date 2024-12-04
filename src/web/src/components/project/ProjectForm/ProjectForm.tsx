/**
 * Project Form Component
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Supports project creation and editing by providing a user-friendly form interface with validation 
 *   and API integration.
 * 
 * Human Tasks:
 * - Verify form validation messages match UX copy requirements
 * - Ensure date picker components are accessible and localized
 * - Configure appropriate form submission timeouts
 */

// react v18.2.0
import { useState, useEffect } from 'react';
import { ProjectInterface } from '../../../interfaces/project.interface';
import useForm from '../../../hooks/useForm';
import { makeApiRequest } from '../../../utils/api.utils';
import { BASE_API_URL } from '../../../constants/api.constants';
import { validateEmail } from '../../../utils/validation.utils';

interface ProjectFormProps {
  projectData?: ProjectInterface;
  onSubmit?: (data: ProjectInterface) => void;
  onCancel?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  projectData,
  onSubmit,
  onCancel
}) => {
  // Initialize form with validation rules
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    setValues,
    validateForm
  } = useForm(
    {
      name: projectData?.name || '',
      description: projectData?.description || '',
      startDate: projectData?.startDate || new Date(),
      endDate: projectData?.endDate || new Date(),
      teamMembers: projectData?.teamMembers || [],
      status: projectData?.status || 'PENDING'
    },
    {
      name: {
        required: true,
        minLength: 3,
        maxLength: 100
      },
      description: {
        required: true,
        maxLength: 500
      },
      startDate: {
        required: true,
        custom: (value) => value instanceof Date && !isNaN(value.getTime())
      },
      endDate: {
        required: true,
        custom: (value) => {
          if (!(value instanceof Date) || isNaN(value.getTime())) return false;
          return value >= values.startDate;
        }
      },
      teamMembers: {
        custom: (value) => {
          if (!Array.isArray(value)) return false;
          return value.every(email => validateEmail(email));
        }
      },
      status: {
        required: true,
        custom: (value) => ['ACTIVE', 'INACTIVE', 'PENDING'].includes(value)
      }
    }
  );

  // Local state for managing team member input
  const [newTeamMember, setNewTeamMember] = useState('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      validateForm();
      return;
    }

    try {
      const endpoint = projectData?.id 
        ? `${BASE_API_URL}/projects/${projectData.id}`
        : `${BASE_API_URL}/projects`;

      const method = projectData?.id ? 'PUT' : 'POST';

      const response = await makeApiRequest(endpoint, {
        method,
        data: values
      });

      onSubmit?.(response);
    } catch (error) {
      console.error('Failed to submit project:', error);
    }
  };

  // Handle adding team members
  const handleAddTeamMember = () => {
    if (validateEmail(newTeamMember) && !values.teamMembers.includes(newTeamMember)) {
      setValues({
        ...values,
        teamMembers: [...values.teamMembers, newTeamMember]
      });
      setNewTeamMember('');
    }
  };

  // Handle removing team members
  const handleRemoveTeamMember = (email: string) => {
    setValues({
      ...values,
      teamMembers: values.teamMembers.filter(member => member !== email)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-group">
        <label htmlFor="name">Project Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.name && touched.name ? 'error' : ''}
        />
        {errors.name && touched.name && (
          <span className="error-message">{errors.name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.description && touched.description ? 'error' : ''}
        />
        {errors.description && touched.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Start Date *</label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          value={values.startDate.toISOString().split('T')[0]}
          onChange={(e) => {
            handleChange({
              target: {
                name: 'startDate',
                value: new Date(e.target.value)
              }
            } as any);
          }}
          onBlur={handleBlur}
          className={errors.startDate && touched.startDate ? 'error' : ''}
        />
        {errors.startDate && touched.startDate && (
          <span className="error-message">{errors.startDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="endDate">End Date *</label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          value={values.endDate.toISOString().split('T')[0]}
          onChange={(e) => {
            handleChange({
              target: {
                name: 'endDate',
                value: new Date(e.target.value)
              }
            } as any);
          }}
          onBlur={handleBlur}
          className={errors.endDate && touched.endDate ? 'error' : ''}
        />
        {errors.endDate && touched.endDate && (
          <span className="error-message">{errors.endDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status *</label>
        <select
          id="status"
          name="status"
          value={values.status}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.status && touched.status ? 'error' : ''}
        >
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        {errors.status && touched.status && (
          <span className="error-message">{errors.status}</span>
        )}
      </div>

      <div className="form-group">
        <label>Team Members</label>
        <div className="team-member-input">
          <input
            type="email"
            value={newTeamMember}
            onChange={(e) => setNewTeamMember(e.target.value)}
            placeholder="Enter team member email"
          />
          <button
            type="button"
            onClick={handleAddTeamMember}
            disabled={!validateEmail(newTeamMember)}
          >
            Add Member
          </button>
        </div>
        {errors.teamMembers && touched.teamMembers && (
          <span className="error-message">{errors.teamMembers}</span>
        )}
        <ul className="team-members-list">
          {values.teamMembers.map((email) => (
            <li key={email} className="team-member">
              {email}
              <button
                type="button"
                onClick={() => handleRemoveTeamMember(email)}
                className="remove-member"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!isValid}>
          {projectData?.id ? 'Update Project' : 'Create Project'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm;