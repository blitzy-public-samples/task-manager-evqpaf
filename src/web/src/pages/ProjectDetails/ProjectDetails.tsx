/**
 * Project Details Page Component
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Supports project organization by providing a detailed view of a project, including its metadata,
 *   team members, and actions for management.
 * 
 * Human Tasks:
 * - Verify that project deletion confirmation modal meets UX requirements
 * - Ensure loading states provide appropriate feedback to users
 * - Test accessibility of project management actions
 */

// React v18.2.0
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Internal imports
import { ProjectInterface } from '../../interfaces/project.interface';
import useProject from '../../hooks/useProject';
import { ProjectCard } from '../../components/project/ProjectCard/ProjectCard';
import ProjectForm from '../../components/project/ProjectForm/ProjectForm';
import { Button } from '../../components/common/Button/Button';
import { ROUTES } from '../../constants/routes.constants';
import { CommonStatus } from '../../types/common.types';

const ProjectDetails: React.FC = () => {
  // Get project ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Initialize project hook
  const {
    getProjectById,
    updateProject,
    deleteProject,
    loading,
    error,
    clearError
  } = useProject();

  // Local state
  const [project, setProject] = useState<ProjectInterface | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Fetch project data on component mount or when ID changes
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) {
        navigate(ROUTES.NOT_FOUND);
        return;
      }

      try {
        const projectData = getProjectById(id);
        if (!projectData) {
          navigate(ROUTES.NOT_FOUND);
          return;
        }
        setProject(projectData);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      }
    };

    fetchProjectData();
  }, [id, navigate, getProjectById]);

  // Handle project update
  const handleProjectUpdate = async (updatedData: ProjectInterface) => {
    if (!project?.id) return;

    try {
      await updateProject(project.id, updatedData);
      setProject(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  // Handle project deletion
  const handleProjectDelete = async () => {
    if (!project?.id) return;

    try {
      await deleteProject(project.id);
      navigate(ROUTES.PROJECTS);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="project-details-loading" role="status" aria-busy="true">
        <p>Loading project details...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="project-details-error" role="alert">
        <p>Error loading project: {error}</p>
        <Button
          label="Try Again"
          onClick={() => {
            clearError();
            if (id) {
              getProjectById(id);
            }
          }}
        />
      </div>
    );
  }

  // Render edit form
  if (isEditing && project) {
    return (
      <div className="project-details-edit">
        <h2>Edit Project</h2>
        <ProjectForm
          projectData={project}
          onSubmit={handleProjectUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Render project details
  return project ? (
    <div className="project-details" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div className="project-details-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          margin: 0,
          color: 'var(--text-color)'
        }}>
          Project Details
        </h1>
        <div className="project-actions" style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <Button
            label="Edit Project"
            onClick={() => setIsEditing(true)}
            status={CommonStatus.ACTIVE}
          />
          <Button
            label="Delete Project"
            onClick={() => setDeleteConfirmOpen(true)}
            status={CommonStatus.INACTIVE}
          />
        </div>
      </div>

      <ProjectCard project={project} />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="delete-confirm-dialog" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--background-color)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              label="Cancel"
              onClick={() => setDeleteConfirmOpen(false)}
              status={CommonStatus.INACTIVE}
            />
            <Button
              label="Delete"
              onClick={handleProjectDelete}
              status={CommonStatus.ACTIVE}
            />
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default ProjectDetails;