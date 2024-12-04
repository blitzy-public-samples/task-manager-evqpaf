/**
 * Unit Tests for NotFound Page Component
 * 
 * Requirements Addressed:
 * - Error Handling and User Experience (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Ensures the NotFound page component behaves as expected, providing a user-friendly interface for handling 404 errors.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure all critical user interactions are tested
 * - Validate accessibility testing requirements
 */

// @testing-library/react v13.4.0
import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from './NotFound';
import { ROUTES } from '../../constants/routes.constants';

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('NotFound Page', () => {
  beforeEach(() => {
    // Clear mock function calls before each test
    mockNavigate.mockClear();
  });

  /**
   * Test: Renders NotFound page correctly
   * Verifies that all essential elements of the 404 page are present
   */
  it('renders NotFound page with all required elements', () => {
    render(<NotFound />);

    // Check for error code
    const errorCode = screen.getByLabelText('Error code 404');
    expect(errorCode).toBeInTheDocument();
    expect(errorCode.textContent).toBe('404');

    // Check for error message
    const errorMessage = screen.getByText('Page Not Found');
    expect(errorMessage).toBeInTheDocument();

    // Check for error description
    const errorDescription = screen.getByText(/The page you are looking for/i);
    expect(errorDescription).toBeInTheDocument();

    // Check for navigation button
    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    expect(backButton).toBeInTheDocument();
  });

  /**
   * Test: Redirects to dashboard on button click
   * Verifies that clicking the back button navigates to the dashboard
   */
  it('redirects to dashboard when back button is clicked', () => {
    render(<NotFound />);

    // Find and click the back button
    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backButton);

    // Verify navigation to dashboard
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  /**
   * Test: Accessibility requirements
   * Verifies that the page meets basic accessibility standards
   */
  it('meets accessibility requirements', () => {
    render(<NotFound />);

    // Check for proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check for proper ARIA labels
    const errorCode = screen.getByLabelText('Error code 404');
    expect(errorCode).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    expect(backButton).toHaveAttribute('aria-label', 'Navigate back to dashboard');
  });

  /**
   * Test: Styled components rendering
   * Verifies that styled components are rendered with proper styling
   */
  it('renders styled components correctly', () => {
    render(<NotFound />);

    // Check for main container
    const container = screen.getByRole('main');
    expect(container).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    });

    // Check for error message styling
    const errorMessage = screen.getByText('Page Not Found');
    expect(errorMessage).toHaveStyle({
      margin: '1rem 0 2rem'
    });
  });
});