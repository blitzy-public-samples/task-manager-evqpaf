/**
 * Custom React Hook for Project Management
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Supports project creation, categorization, team assignment, milestone tracking,
 *   and progress monitoring through a custom hook.
 * 
 * Human Tasks:
 * - Verify Redux store configuration is properly set up
 * - Ensure proper error handling strategies are implemented
 * - Review state update patterns for optimization
 */

// react-redux v8.0.5
import { useDispatch, useSelector } from 'react-redux';
import { ProjectInterface } from '../interfaces/project.interface';
import {
  fetchProjects,
  addProject,
  editProject,
  removeProject,
  setError
} from '../store/project/project.slice';

/**
 * Custom hook for managing project-related operations.
 * Provides methods for CRUD operations and access to project state.
 * 
 * @returns Object containing project state and management functions
 */
const useProject = () => {
  const dispatch = useDispatch();

  // Select project state from Redux store
  const projects = useSelector((state: any) => state.project.projects);
  const loading = useSelector((state: any) => state.project.loading);
  const error = useSelector((state: any) => state.project.error);

  /**
   * Fetches all projects from the backend
   * @returns Promise that resolves when projects are fetched
   */
  const getProjects = async () => {
    try {
      await dispatch(fetchProjects()).unwrap();
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  /**
   * Creates a new project
   * @param projectData - The project data to create
   * @returns Promise that resolves with the created project
   */
  const createProject = async (projectData: ProjectInterface) => {
    try {
      const result = await dispatch(addProject(projectData)).unwrap();
      return result;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  /**
   * Updates an existing project
   * @param projectId - ID of the project to update
   * @param projectData - Partial project data to update
   * @returns Promise that resolves with the updated project
   */
  const updateProject = async (
    projectId: string,
    projectData: Partial<ProjectInterface>
  ) => {
    try {
      const result = await dispatch(
        editProject({ projectId, projectData })
      ).unwrap();
      return result;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  /**
   * Deletes a project
   * @param projectId - ID of the project to delete
   * @returns Promise that resolves when the project is deleted
   */
  const deleteProject = async (projectId: string) => {
    try {
      await dispatch(removeProject(projectId)).unwrap();
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  /**
   * Gets a project by ID
   * @param projectId - ID of the project to retrieve
   * @returns The project if found, undefined otherwise
   */
  const getProjectById = (projectId: string) => {
    return projects.find((project: ProjectInterface) => project.id === projectId);
  };

  /**
   * Clears any project-related errors
   */
  const clearError = () => {
    dispatch(setError(null));
  };

  return {
    // State
    projects,
    loading,
    error,
    
    // Operations
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    clearError
  };
};

export default useProject;