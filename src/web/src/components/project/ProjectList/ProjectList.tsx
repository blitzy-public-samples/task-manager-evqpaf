/**
 * ProjectList Component
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Supports project creation, categorization, team assignment, milestone tracking, and progress monitoring
 *   by displaying a list of projects.
 * 
 * Human Tasks:
 * - Verify grid layout responsiveness on different screen sizes
 * - Ensure loading states provide good user experience
 * - Test error handling and retry mechanisms
 */

// React v18.2.0
import React, { useEffect, useState } from 'react';

// Internal imports
import { ProjectInterface } from '../../../interfaces/project.interface';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import useProject from '../../../hooks/useProject';

export const ProjectList: React.FC = () => {
  // Initialize project hook
  const { 
    projects, 
    loading, 
    error, 
    getProjects, 
    clearError 
  } = useProject();

  // Local state for error handling
  const [retryCount, setRetryCount] = useState(0);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        await getProjects();
      } catch (error) {
        // Error is handled by the hook and stored in error state
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjectData();
  }, [getProjects, retryCount]);

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    setRetryCount(prev => prev + 1);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="project-list-loading" style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-color)'
      }}>
        <p>Loading projects...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="project-list-error" style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-color)'
      }}>
        <p>Error loading projects: {error}</p>
        <button 
          onClick={handleRetry}
          style={{
            padding: '0.5rem 1rem',
            marginTop: '1rem',
            backgroundColor: 'var(--primary-color)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Render empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="project-list-empty" style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-color)'
      }}>
        <p>No projects found.</p>
      </div>
    );
  }

  // Render project list
  return (
    <div className="project-list" style={{
      padding: '1rem'
    }}>
      <div className="project-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        alignItems: 'stretch'
      }}>
        {projects.map((project: ProjectInterface) => (
          <ProjectCard
            key={project.id}
            project={{
              id: project.id,
              name: project.name,
              description: project.description,
              status: project.status
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;