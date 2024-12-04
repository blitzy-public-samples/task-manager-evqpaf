/**
 * Projects Page Component
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Supports project creation, categorization, team assignment, milestone tracking, and progress monitoring
 *   by providing a user interface for managing projects.
 * 
 * Human Tasks:
 * - Verify loading states provide good user experience
 * - Test error handling and retry mechanisms
 * - Ensure project list updates correctly after CRUD operations
 */

// React v18.2.0
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // react-redux v8.1.0

// Internal imports
import ProjectList from '../../components/project/ProjectList/ProjectList';
import ProjectForm from '../../components/project/ProjectForm/ProjectForm';
import { fetchProjects } from '../../store/project/project.slice';
import { ROUTES } from '../../constants/routes.constants';

/**
 * Projects page component that displays a list of projects and provides
 * functionality for creating, editing, and managing projects.
 */
const ProjectsPage: React.FC = () => {
  const dispatch = useDispatch();

  // Select projects state from Redux store
  const { projects, loading, error } = useSelector((state: any) => state.project);

  // Fetch projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        await dispatch(fetchProjects());
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    loadProjects();
  }, [dispatch]);

  return (
    <div className="projects-page" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '2rem',
          color: 'var(--text-color)'
        }}>
          Projects
        </h1>
      </header>

      <div className="projects-content" style={{
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: '1fr',
        alignItems: 'start'
      }}>
        {/* Project List Section */}
        <section className="projects-list-section">
          <ProjectList />
        </section>

        {/* Project Form Section */}
        <section className="project-form-section" style={{
          backgroundColor: 'var(--background-color)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1.5rem',
            color: 'var(--text-color)'
          }}>
            Create New Project
          </h2>
          <ProjectForm />
        </section>
      </div>
    </div>
  );
};

export default ProjectsPage;