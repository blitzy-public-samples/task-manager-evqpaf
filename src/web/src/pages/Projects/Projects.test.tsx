/**
 * Unit and Integration Tests for Projects Page
 * 
 * Requirements Addressed:
 * - Testing Requirements (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
 *   Ensures the Projects page functions correctly by testing its components, API interactions,
 *   and state management.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user flows are tested
 * - Review error handling test cases
 */

// @testing-library/react v14.0.0
import { render, screen } from '@testing-library/react';
// @jest/globals v29.0.0
import { describe, it, expect } from '@jest/globals';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ProjectsPage from './Projects';
import { mockGetTasksHandler } from '../../../tests/mocks/handlers';
import { setupTests } from '../../../tests/setup';
import store from '../../store/store';
import { ROUTES } from '../../constants/routes.constants';

// Initialize test environment
setupTests();

// Wrap component with required providers
const renderProjectsPage = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ProjectsPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('ProjectsPage Component', () => {
  it('should render the projects page title', () => {
    renderProjectsPage();
    
    const pageTitle = screen.getByRole('heading', { name: /projects/i });
    expect(pageTitle).toBeInTheDocument();
  });

  it('should render the project list section', () => {
    renderProjectsPage();
    
    const projectListSection = screen.getByRole('region', { name: /projects list/i });
    expect(projectListSection).toBeInTheDocument();
  });

  it('should render the create project form section', () => {
    renderProjectsPage();
    
    const createProjectSection = screen.getByRole('region', { name: /create new project/i });
    expect(createProjectSection).toBeInTheDocument();
  });

  it('should display loading state while fetching projects', () => {
    renderProjectsPage();
    
    const loadingElement = screen.getByText(/loading projects/i);
    expect(loadingElement).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error response
    mockGetTasksHandler.mockImplementationOnce((req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({ message: 'Failed to fetch projects' })
      );
    });

    renderProjectsPage();
    
    const errorMessage = await screen.findByText(/failed to fetch projects/i);
    expect(errorMessage).toBeInTheDocument();

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should display empty state when no projects exist', async () => {
    // Mock empty projects response
    mockGetTasksHandler.mockImplementationOnce((req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ data: [] })
      );
    });

    renderProjectsPage();
    
    const emptyMessage = await screen.findByText(/no projects found/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('should render project cards when projects exist', async () => {
    // Mock projects response
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project 1',
        description: 'Test Description 1',
        status: 'ACTIVE'
      },
      {
        id: '2',
        name: 'Test Project 2',
        description: 'Test Description 2',
        status: 'PENDING'
      }
    ];

    mockGetTasksHandler.mockImplementationOnce((req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ data: mockProjects })
      );
    });

    renderProjectsPage();
    
    // Verify project cards are rendered
    const projectCards = await screen.findAllByRole('article');
    expect(projectCards).toHaveLength(mockProjects.length);

    // Verify project details are displayed
    mockProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
      expect(screen.getByText(project.description)).toBeInTheDocument();
      expect(screen.getByText(project.status)).toBeInTheDocument();
    });
  });

  it('should navigate to project details when view details is clicked', async () => {
    const mockProject = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      status: 'ACTIVE'
    };

    mockGetTasksHandler.mockImplementationOnce((req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ data: [mockProject] })
      );
    });

    renderProjectsPage();
    
    // Wait for project card to render
    const viewDetailsButton = await screen.findByRole('button', { 
      name: new RegExp(`view details for project ${mockProject.name}`, 'i') 
    });

    // Click view details button
    viewDetailsButton.click();

    // Verify navigation
    expect(window.location.pathname).toBe(`${ROUTES.PROJECTS}/${mockProject.id}`);
  });

  it('should integrate with Redux store for state management', async () => {
    renderProjectsPage();
    
    // Verify initial state
    expect(store.getState().project.loading).toBe(true);
    expect(store.getState().project.error).toBe(null);

    // Wait for projects to load
    await screen.findByRole('region', { name: /projects list/i });

    // Verify updated state
    expect(store.getState().project.loading).toBe(false);
    expect(store.getState().project.projects).toBeDefined();
  });
});