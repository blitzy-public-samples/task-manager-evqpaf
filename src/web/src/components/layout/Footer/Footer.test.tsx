// @testing-library/react v13.4.0
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';
import { setupTests } from '../../../../tests/setup';
import { mockGetTasksHandler } from '../../../../tests/mocks/handlers';
import { ROUTES } from '../../../constants/routes.constants';

/**
 * Human Tasks:
 * - Verify that all test cases cover the required functionality
 * - Ensure test coverage meets project requirements
 * - Update tests when new footer features are added
 */

// Set up test environment
setupTests();

// Wrapper component for Router context
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Footer Component', () => {
  /**
   * Requirements Addressed:
   * - Testing Requirements (Technical Specification/3.3 API Design/3.3.3 Integration Requirements)
   *   Tests footer rendering, navigation links, and theme toggle functionality
   */

  beforeEach(() => {
    // Reset local storage before each test
    localStorage.clear();
  });

  test('renders footer with all navigation sections', () => {
    renderWithRouter(<Footer />);

    // Verify section headings
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  test('renders all navigation links correctly', () => {
    renderWithRouter(<Footer />);

    // Verify navigation links
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', ROUTES.DASHBOARD);
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', ROUTES.PROJECTS);
    expect(screen.getByRole('link', { name: /tasks/i })).toHaveAttribute('href', ROUTES.TASKS);
  });

  test('renders account links correctly', () => {
    renderWithRouter(<Footer />);

    // Verify account links
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', ROUTES.PROFILE);
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', ROUTES.LOGIN);
  });

  test('theme toggle button changes theme', () => {
    renderWithRouter(<Footer />);
    
    // Get theme toggle button
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeToggle).toBeInTheDocument();

    // Initial state should be light theme
    expect(themeToggle).toHaveTextContent(/dark mode/i);

    // Click to toggle theme
    fireEvent.click(themeToggle);

    // Should now show light mode option (indicating dark theme is active)
    expect(themeToggle).toHaveTextContent(/light mode/i);
  });

  test('renders copyright text with current year', () => {
    renderWithRouter(<Footer />);
    
    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(new RegExp(`© ${currentYear} Task Management System`));
    expect(copyrightText).toBeInTheDocument();
  });

  test('footer links have correct hover styles', () => {
    renderWithRouter(<Footer />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      // Verify initial color
      expect(link).toHaveStyle({ color: 'var(--text-color)' });

      // Simulate hover
      fireEvent.mouseOver(link);
      
      // Verify hover color change
      expect(link).toHaveStyle({ color: 'var(--primary-color)' });
    });
  });

  test('theme toggle button is accessible', () => {
    renderWithRouter(<Footer />);
    
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    
    // Verify accessibility attributes
    expect(themeToggle).toHaveAttribute('aria-label', 'Toggle theme');
    expect(themeToggle).toHaveAttribute('title', 'Toggle between light and dark theme');
  });

  test('footer renders with correct responsive styles', () => {
    renderWithRouter(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    
    // Verify base styles
    expect(footer).toHaveStyle({
      width: '100%',
      backgroundColor: 'var(--background-color)',
      borderTop: '1px solid var(--border-color)'
    });
  });
});