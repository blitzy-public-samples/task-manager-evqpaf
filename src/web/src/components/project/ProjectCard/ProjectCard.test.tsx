/**
 * Requirements Addressed:
 * - Testing Requirements (Technical Specification/4.5 Development & Deployment/Testing)
 *   Ensures the ProjectCard component functions as expected through unit tests.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user interactions are tested
 * - Update tests when component functionality changes
 */

// @testing-library/react v13.4.0
import { render, screen } from '@testing-library/react';
// @jest/globals v29.0.0
import { describe, it, expect, beforeAll } from '@jest/globals';
import { ProjectCard } from './ProjectCard';
import { mockGetTasksHandler } from '../../../tests/mocks/handlers';
import { initializeMockServer } from '../../../tests/mocks/server';
import { setupTests } from '../../../tests/setup';
import { CommonStatus } from '../../../types/common.types';

// Mock react-router-dom navigation
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Initialize test environment
setupTests();
initializeMockServer();

describe('ProjectCard Component', () => {
  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'A test project description',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    teamMembers: ['user-1', 'user-2'],
    status: CommonStatus.ACTIVE
  };

  beforeAll(() => {
    // Set up any required mock handlers
    mockGetTasksHandler;
  });

  it('renders project name correctly', () => {
    render(<ProjectCard project={mockProject} />);
    const projectName = screen.getByText(mockProject.name);
    expect(projectName).toBeInTheDocument();
  });

  it('renders project description correctly', () => {
    render(<ProjectCard project={mockProject} />);
    const projectDescription = screen.getByText(mockProject.description);
    expect(projectDescription).toBeInTheDocument();
  });

  it('renders project status correctly', () => {
    render(<ProjectCard project={mockProject} />);
    const projectStatus = screen.getByText(mockProject.status);
    expect(projectStatus).toBeInTheDocument();
  });

  it('renders view details button', () => {
    render(<ProjectCard project={mockProject} />);
    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    expect(viewDetailsButton).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<ProjectCard project={mockProject} />);
    const viewDetailsButton = screen.getByRole('button', {
      name: `View details for project ${mockProject.name}`
    });
    expect(viewDetailsButton).toHaveAttribute('aria-label', `View details for project ${mockProject.name}`);
  });

  it('applies correct styling to project status', () => {
    render(<ProjectCard project={mockProject} />);
    const statusElement = screen.getByText(mockProject.status);
    const computedStyles = window.getComputedStyle(statusElement);
    
    expect(computedStyles.backgroundColor).toBe('var(--primary-color)');
    expect(computedStyles.color).toBe('#FFFFFF');
    expect(computedStyles.borderRadius).toBe('1rem');
    expect(computedStyles.padding).toBe('0.25rem 0.75rem');
  });

  it('applies correct styling to project description', () => {
    render(<ProjectCard project={mockProject} />);
    const descriptionElement = screen.getByText(mockProject.description);
    const computedStyles = window.getComputedStyle(descriptionElement);
    
    expect(computedStyles.margin).toBe('0 0 1rem 0');
    expect(computedStyles.fontSize).toBe('1rem');
    expect(computedStyles.lineHeight).toBe('1.5');
  });

  it('handles navigation when view details is clicked', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(<ProjectCard project={mockProject} />);
    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    viewDetailsButton.click();

    expect(mockNavigate).toHaveBeenCalledWith(`/projects/${mockProject.id}`);
  });

  it('renders within a Card component wrapper', () => {
    render(<ProjectCard project={mockProject} />);
    const cardWrapper = screen.getByTestId('card');
    expect(cardWrapper).toHaveClass('project-card');
  });
});