/**
 * Unit and integration tests for the ProjectForm component
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Ensures the ProjectForm component functions correctly for creating and editing projects,
 *   including validation and API integration.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure mock data matches production data structures
 * - Configure CI/CD pipeline to run tests automatically
 */

// @testing-library/react v13.4.0
import { render, fireEvent, screen } from '@testing-library/react';
// jest v29.0.0
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ProjectForm from './ProjectForm';
import { validateEmail } from '../../../utils/validation.utils';
import useProject from '../../../hooks/useProject';
import { BASE_API_URL } from '../../../constants/api.constants';
import { ROUTES } from '../../../constants/routes.constants';
import store from '../../../store/store';

// Mock the hooks and utilities
jest.mock('../../../hooks/useProject');
jest.mock('../../../utils/validation.utils');
jest.mock('../../../utils/api.utils');

describe('ProjectForm Component', () => {
  // Mock data for testing
  const mockProject = {
    id: '123',
    name: 'Test Project',
    description: 'Test Description',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    teamMembers: ['test@example.com'],
    status: 'ACTIVE'
  };

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  // Setup and cleanup
  beforeEach(() => {
    jest.clearAllMocks();
    (validateEmail as jest.Mock).mockImplementation((email) => 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    (useProject as jest.Mock).mockReturnValue({
      createProject: jest.fn(),
      updateProject: jest.fn(),
      error: null,
      loading: false
    });
  });

  // Helper function to render component with required providers
  const renderProjectForm = (props = {}) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ProjectForm {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Form Rendering', () => {
    test('renders all required form fields', () => {
      renderProjectForm();

      // Verify all required fields are present
      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByText(/team members/i)).toBeInTheDocument();
    });

    test('populates form fields with project data when editing', () => {
      renderProjectForm({ projectData: mockProject });

      expect(screen.getByLabelText(/project name/i)).toHaveValue(mockProject.name);
      expect(screen.getByLabelText(/description/i)).toHaveValue(mockProject.description);
      expect(screen.getByLabelText(/status/i)).toHaveValue(mockProject.status);
      expect(screen.getByText(mockProject.teamMembers[0])).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('displays validation errors for required fields', async () => {
      renderProjectForm();
      
      // Submit form without filling required fields
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      // Check for validation error messages
      expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
    });

    test('validates project name length', () => {
      renderProjectForm();
      const nameInput = screen.getByLabelText(/project name/i);

      // Test too short name
      fireEvent.change(nameInput, { target: { value: 'ab' } });
      fireEvent.blur(nameInput);
      expect(screen.getByText(/minimum length is 3 characters/i)).toBeInTheDocument();

      // Test too long name
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(101) } });
      fireEvent.blur(nameInput);
      expect(screen.getByText(/maximum length is 100 characters/i)).toBeInTheDocument();
    });

    test('validates team member email addresses', () => {
      renderProjectForm();
      const emailInput = screen.getByPlaceholderText(/enter team member email/i);

      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(screen.queryByText('invalid-email')).not.toBeInTheDocument();

      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(screen.getByText('valid@example.com')).toBeInTheDocument();
    });

    test('validates end date is after start date', () => {
      renderProjectForm();
      
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      // Set end date before start date
      fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });
      fireEvent.blur(endDateInput);

      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data when submitted', async () => {
      renderProjectForm({ onSubmit: mockOnSubmit });

      // Fill out form
      fireEvent.change(screen.getByLabelText(/project name/i), 
        { target: { value: 'New Project' } });
      fireEvent.change(screen.getByLabelText(/description/i), 
        { target: { value: 'Project Description' } });
      fireEvent.change(screen.getByLabelText(/start date/i), 
        { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText(/end date/i), 
        { target: { value: '2024-12-31' } });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      // Verify onSubmit was called with correct data
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Project',
        description: 'Project Description'
      }));
    });

    test('handles API errors during submission', async () => {
      const mockError = new Error('API Error');
      (useProject as jest.Mock).mockReturnValue({
        createProject: jest.fn().mockRejectedValue(mockError),
        error: 'API Error',
        loading: false
      });

      renderProjectForm();

      // Fill out and submit form
      fireEvent.change(screen.getByLabelText(/project name/i), 
        { target: { value: 'New Project' } });
      fireEvent.change(screen.getByLabelText(/description/i), 
        { target: { value: 'Description' } });
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      // Verify error handling
      expect(await screen.findByText(/api error/i)).toBeInTheDocument();
    });
  });

  describe('Team Member Management', () => {
    test('allows adding and removing team members', () => {
      renderProjectForm();
      const emailInput = screen.getByPlaceholderText(/enter team member email/i);

      // Add team member
      fireEvent.change(emailInput, { target: { value: 'team@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(screen.getByText('team@example.com')).toBeInTheDocument();

      // Remove team member
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      expect(screen.queryByText('team@example.com')).not.toBeInTheDocument();
    });

    test('prevents duplicate team members', () => {
      renderProjectForm();
      const emailInput = screen.getByPlaceholderText(/enter team member email/i);
      const email = 'team@example.com';

      // Add team member twice
      fireEvent.change(emailInput, { target: { value: email } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      fireEvent.change(emailInput, { target: { value: email } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));

      // Verify only one instance exists
      const teamMembers = screen.getAllByText(email);
      expect(teamMembers).toHaveLength(1);
    });
  });
});