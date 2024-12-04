// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest v29.0.0
import { jest } from '@jest/globals';
import React from 'react'; // v18.2.0

// Internal imports
import ProjectDetails from './ProjectDetails';
import useProject from '../../hooks/useProject';
import useTask from '../../hooks/useTask';
import { ProjectCard } from '../../components/project/ProjectCard/ProjectCard';
import ProjectForm from '../../components/project/ProjectForm/ProjectForm';
import TaskList from '../../components/task/TaskList/TaskList';

// Mock the required hooks and components
jest.mock('../../hooks/useProject');
jest.mock('../../hooks/useTask');
jest.mock('../../components/project/ProjectCard/ProjectCard');
jest.mock('../../components/project/ProjectForm/ProjectForm');
jest.mock('../../components/task/TaskList/TaskList');
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'test-project-id' }),
  useNavigate: () => jest.fn()
}));

describe('ProjectDetails Component', () => {
  // Mock project data
  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'Test project description',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    teamMembers: ['user1@test.com', 'user2@test.com'],
    status: 'ACTIVE'
  };

  // Setup mock functions
  const mockGetProjectById = jest.fn();
  const mockUpdateProject = jest.fn();
  const mockDeleteProject = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock useProject hook implementation
    (useProject as jest.Mock).mockReturnValue({
      getProjectById: mockGetProjectById.mockReturnValue(mockProject),
      updateProject: mockUpdateProject,
      deleteProject: mockDeleteProject,
      loading: false,
      error: null,
      clearError: jest.fn()
    });

    // Mock useTask hook implementation
    (useTask as jest.Mock).mockReturnValue({
      tasks: [],
      loading: false,
      error: null
    });

    // Mock component implementations
    (ProjectCard as jest.Mock).mockImplementation(() => <div>Project Card</div>);
    (ProjectForm as jest.Mock).mockImplementation(() => <div>Project Form</div>);
    (TaskList as jest.Mock).mockImplementation(() => <div>Task List</div>);
  });

  /**
   * Test: Project Details Rendering
   * Requirements Addressed:
   * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('renders project details correctly with mock project data', () => {
    render(<ProjectDetails />);

    // Verify project data is fetched
    expect(mockGetProjectById).toHaveBeenCalledWith('test-project-id');

    // Verify components are rendered
    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Project Card')).toBeInTheDocument();
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByText('Delete Project')).toBeInTheDocument();
  });

  /**
   * Test: Project Editing
   * Requirements Addressed:
   * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('handles project editing correctly', async () => {
    render(<ProjectDetails />);

    // Click edit button
    const editButton = screen.getByText('Edit Project');
    fireEvent.click(editButton);

    // Verify edit form is displayed
    expect(screen.getByText('Project Form')).toBeInTheDocument();

    // Simulate form submission
    const updatedProject = { ...mockProject, name: 'Updated Project' };
    const formSubmitHandler = (ProjectForm as jest.Mock).mock.calls[0][0].onSubmit;
    await formSubmitHandler(updatedProject);

    // Verify project update was called
    expect(mockUpdateProject).toHaveBeenCalledWith(mockProject.id, updatedProject);
  });

  /**
   * Test: Project Deletion
   * Requirements Addressed:
   * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('handles project deletion correctly', async () => {
    render(<ProjectDetails />);

    // Click delete button
    const deleteButton = screen.getByText('Delete Project');
    fireEvent.click(deleteButton);

    // Verify confirmation dialog is shown
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    // Verify delete was called
    expect(mockDeleteProject).toHaveBeenCalledWith(mockProject.id);
  });

  /**
   * Test: Loading State
   * Requirements Addressed:
   * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('displays loading state correctly', () => {
    (useProject as jest.Mock).mockReturnValue({
      ...useProject(),
      loading: true
    });

    render(<ProjectDetails />);
    expect(screen.getByText('Loading project details...')).toBeInTheDocument();
  });

  /**
   * Test: Error State
   * Requirements Addressed:
   * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('displays error state correctly', () => {
    const errorMessage = 'Failed to load project';
    (useProject as jest.Mock).mockReturnValue({
      ...useProject(),
      error: errorMessage
    });

    render(<ProjectDetails />);
    expect(screen.getByText(`Error loading project: ${errorMessage}`)).toBeInTheDocument();
  });

  /**
   * Test: Project Not Found
   * Requirements Addressed:
   * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
   */
  test('handles project not found correctly', () => {
    (useProject as jest.Mock).mockReturnValue({
      ...useProject(),
      getProjectById: jest.fn().mockReturnValue(null)
    });

    render(<ProjectDetails />);
    expect(mockNavigate).toHaveBeenCalledWith('/404');
  });
});