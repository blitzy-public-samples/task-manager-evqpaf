/**
 * Project Service
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Implements API interactions for project creation, categorization, team assignment, milestone tracking,
 *   and progress monitoring.
 * 
 * Human Tasks:
 * - Verify API endpoint URLs match the backend configuration
 * - Ensure proper error handling and logging is configured in production
 * - Review request timeout settings based on API performance metrics
 */

// axios v1.4.0
import { ProjectInterface } from '../interfaces/project.interface';
import { makeApiRequest } from '../utils/api.utils';
import { BASE_API_URL } from '../constants/api.constants';

/**
 * Fetches a list of all projects from the API.
 * 
 * @returns Promise<ProjectInterface[]> A promise that resolves to an array of project entities
 * @throws ApiRequestError if the request fails
 */
export async function getProjects(): Promise<ProjectInterface[]> {
  try {
    const response = await makeApiRequest('/projects', {
      method: 'GET'
    });
    
    // Transform dates from string to Date objects
    return response.map((project: any) => ({
      ...project,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate)
    }));
  } catch (error) {
    // Let the error propagate up to be handled by the global error handler
    throw error;
  }
}

/**
 * Creates a new project via the API.
 * 
 * @param projectData - The project data to create
 * @returns Promise<ProjectInterface> A promise that resolves to the created project entity
 * @throws ApiRequestError if the request fails
 */
export async function createProject(projectData: ProjectInterface): Promise<ProjectInterface> {
  try {
    const response = await makeApiRequest('/projects', {
      method: 'POST',
      data: {
        ...projectData,
        // Ensure dates are properly formatted for the API
        startDate: projectData.startDate.toISOString(),
        endDate: projectData.endDate.toISOString()
      }
    });

    // Transform the response dates back to Date objects
    return {
      ...response,
      startDate: new Date(response.startDate),
      endDate: new Date(response.endDate)
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Updates an existing project via the API.
 * 
 * @param projectId - The ID of the project to update
 * @param projectData - The partial project data to update
 * @returns Promise<ProjectInterface> A promise that resolves to the updated project entity
 * @throws ApiRequestError if the request fails
 */
export async function updateProject(
  projectId: string,
  projectData: Partial<ProjectInterface>
): Promise<ProjectInterface> {
  try {
    // Transform dates to ISO strings if they exist in the update data
    const formattedData = {
      ...projectData,
      startDate: projectData.startDate?.toISOString(),
      endDate: projectData.endDate?.toISOString()
    };

    const response = await makeApiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      data: formattedData
    });

    // Transform the response dates back to Date objects
    return {
      ...response,
      startDate: new Date(response.startDate),
      endDate: new Date(response.endDate)
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Deletes a project via the API.
 * 
 * @param projectId - The ID of the project to delete
 * @returns Promise<void> A promise that resolves when the project is successfully deleted
 * @throws ApiRequestError if the request fails
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await makeApiRequest(`/projects/${projectId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    throw error;
  }
}