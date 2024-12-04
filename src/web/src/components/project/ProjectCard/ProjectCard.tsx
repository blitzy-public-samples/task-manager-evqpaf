/**
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Provides a visual representation of project details, including name, description, status, and team members.
 * 
 * Human Tasks:
 * - Verify that card styles align with design system specifications
 * - Ensure card animations and transitions perform well on target devices
 * - Test card accessibility with screen readers
 */

// React v18.2.0
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports
import { ProjectInterface } from '../../../interfaces/project.interface';
import { ROUTES } from '../../../constants/routes.constants';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';

interface ProjectCardProps {
  project: ProjectInterface;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`${ROUTES.PROJECTS}/${project.id}`);
  };

  const renderProjectHeader = () => {
    return (
      <div className="project-card-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'var(--text-color)'
        }}>
          {project.name}
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.875rem',
          backgroundColor: 'var(--primary-color)',
          color: '#FFFFFF'
        }}>
          {project.status}
        </span>
      </div>
    );
  };

  const renderProjectFooter = () => {
    return (
      <div className="project-card-footer" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%'
      }}>
        <Button
          label="View Details"
          onClick={handleViewDetails}
          aria-label={`View details for project ${project.name}`}
        />
      </div>
    );
  };

  return (
    <Card
      className="project-card"
      renderHeader={renderProjectHeader}
      renderFooter={renderProjectFooter}
    >
      <div className="project-card-content" style={{
        padding: '1rem 0',
        color: 'var(--text-color)'
      }}>
        <p style={{
          margin: '0 0 1rem 0',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          {project.description}
        </p>
      </div>
    </Card>
  );
};