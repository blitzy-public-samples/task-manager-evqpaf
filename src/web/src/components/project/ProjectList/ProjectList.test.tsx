/**
 * ProjectList Component Tests
 * 
 * Requirements Addressed:
 * - Testing Requirements (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
 *   Ensures the ProjectList component behaves as expected under various scenarios,
 *   including successful data fetching, error handling, and empty states.
 */

// React v18.2.0
import React from 'react';
// @testing-library/react v13.4.0
import { render, screen, waitFor } from '@testing-library/react';
// msw v0.47.4
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Internal imports
import ProjectList from './ProjectList';
import useProject from '../../../hooks/useProject';
import { mockGetTasksHandler } from '../../../../tests/mocks/handlers';
import { BASE_API_URL } from '../../../constants/api.constants';

// Mock the useProject hook
jest.mock('../../../hooks/useProject');

// Mock project data
const mockProjects = [
  {
    id: '1',
    name: 'Project Alpha',
    description: 'First test project',
    status: 'ACTIVE',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    teamMembers: ['user1', 'user2']
  },
  {
    id: '2',
    name: 'Project Beta',
    description: 'Second test project',
    status: 'IN_PROGRESS',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    teamMembers: ['user3', 'user4']
  }
];

// Set up MSW server
const server = setupServer(
  rest.get(`${BASE_API_URL}/projects`, (req, res, ctx) => {
    return res(ctx.json(mockProjects));
  }),
  mockGetTasksHandler
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProjectList Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Tests that the ProjectList component renders correctly with mock project data.
   */
  test('renders project list successfully', async () => {
    // Mock useProject hook implementation
    (useProject as jest.Mock).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
      getProjects: jest.fn()
    });

    render(<ProjectList />);

    // Wait for projects to be rendered
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });

    // Verify project descriptions are displayed
    expect(screen.getByText('First test project')).toBeInTheDocument();
    expect(screen.getByText('Second test project')).toBeInTheDocument();

    // Verify project statuses are displayed
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
  });

  /**
   * Tests that the ProjectList component displays a loading indicator
   * while fetching data.
   */
  test('displays loading state while fetching projects', () => {
    // Mock useProject hook with loading state
    (useProject as jest.Mock).mockReturnValue({
      projects: [],
      loading: true,
      error: null,
      getProjects: jest.fn()
    });

    render(<ProjectList />);

    // Verify loading message is displayed
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  /**
   * Tests that the ProjectList component displays an error message
   * when the API request fails.
   */
  test('displays error message when API request fails', async () => {
    const errorMessage = 'Failed to fetch projects';

    // Mock useProject hook with error state
    (useProject as jest.Mock).mockReturnValue({
      projects: [],
      loading: false,
      error: errorMessage,
      getProjects: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProjectList />);

    // Verify error message is displayed
    expect(screen.getByText(`Error loading projects: ${errorMessage}`)).toBeInTheDocument();

    // Verify retry button is present
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  /**
   * Tests that the ProjectList component displays an empty state message
   * when no projects are available.
   */
  test('displays empty state when no projects are available', () => {
    // Mock useProject hook with empty projects array
    (useProject as jest.Mock).mockReturnValue({
      projects: [],
      loading: false,
      error: null,
      getProjects: jest.fn()
    });

    render(<ProjectList />);

    // Verify empty state message is displayed
    expect(screen.getByText('No projects found.')).toBeInTheDocument();
  });

  /**
   * Tests that the getProjects function is called on component mount
   */
  test('calls getProjects on component mount', () => {
    const getProjectsMock = jest.fn();

    // Mock useProject hook with mock getProjects function
    (useProject as jest.Mock).mockReturnValue({
      projects: [],
      loading: false,
      error: null,
      getProjects: getProjectsMock
    });

    render(<ProjectList />);

    // Verify getProjects was called
    expect(getProjectsMock).toHaveBeenCalledTimes(1);
  });

  /**
   * Tests that the retry button triggers a new API request
   */
  test('retry button triggers new API request', async () => {
    const getProjectsMock = jest.fn();
    const clearErrorMock = jest.fn();

    // Mock useProject hook with error state and mock functions
    (useProject as jest.Mock).mockReturnValue({
      projects: [],
      loading: false,
      error: 'Failed to fetch projects',
      getProjects: getProjectsMock,
      clearError: clearErrorMock
    });

    render(<ProjectList />);

    // Click retry button
    const retryButton = screen.getByText('Retry');
    retryButton.click();

    // Verify error was cleared and new request was triggered
    expect(clearErrorMock).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(getProjectsMock).toHaveBeenCalledTimes(1);
    });
  });
});