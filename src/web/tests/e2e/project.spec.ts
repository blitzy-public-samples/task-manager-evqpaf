/**
 * Project E2E Test Suite
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Ensures project-related functionalities such as creation, retrieval, updating, and deletion 
 *   are working as expected through E2E tests.
 * 
 * Human Tasks:
 * - Verify test data matches production data format requirements
 * - Ensure test browser configuration matches CI/CD environment
 * - Review test retry and timeout settings based on environment performance
 */

// @playwright/test v1.38.0
import { test, expect } from '@playwright/test';
import { getProjects, createProject } from '../../src/services/project.service';
import { ROUTES } from '../../src/constants/routes.constants';
import { initializeMockServer } from '../mocks/server';
import { mockGetTasksHandler } from '../mocks/handlers';
import { setupTests } from '../setup';

// Initialize test environment
setupTests();
const server = initializeMockServer();

// Mock project data for testing
const mockProject = {
  id: 'test-proj-1',
  name: 'Test Project',
  description: 'A test project for E2E testing',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  teamMembers: ['user-1', 'user-2'],
  status: 'ACTIVE'
};

test.describe('Project E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects page before each test
    await page.goto(ROUTES.PROJECTS);
    
    // Wait for initial data load
    await page.waitForSelector('[data-testid="projects-list"]');
  });

  test('should display project list correctly', async ({ page }) => {
    // Mock API response for projects
    const projects = await getProjects();
    
    // Verify projects are displayed
    const projectElements = await page.$$('[data-testid="project-item"]');
    expect(projectElements.length).toBe(projects.length);

    // Verify project details are displayed correctly
    for (const project of projects) {
      const projectElement = await page.$(`[data-testid="project-${project.id}"]`);
      expect(projectElement).toBeTruthy();

      // Verify project name
      const nameElement = await projectElement.$('[data-testid="project-name"]');
      const name = await nameElement?.textContent();
      expect(name).toBe(project.name);

      // Verify project status
      const statusElement = await projectElement.$('[data-testid="project-status"]');
      const status = await statusElement?.textContent();
      expect(status).toBe(project.status);
    }
  });

  test('should create new project successfully', async ({ page }) => {
    // Click create project button
    await page.click('[data-testid="create-project-button"]');
    
    // Fill project form
    await page.fill('[data-testid="project-name-input"]', mockProject.name);
    await page.fill('[data-testid="project-description-input"]', mockProject.description);
    await page.fill('[data-testid="project-start-date-input"]', mockProject.startDate.toISOString().split('T')[0]);
    await page.fill('[data-testid="project-end-date-input"]', mockProject.endDate.toISOString().split('T')[0]);
    
    // Select team members
    for (const memberId of mockProject.teamMembers) {
      await page.click(`[data-testid="team-member-${memberId}"]`);
    }

    // Submit form
    await page.click('[data-testid="submit-project-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toHaveText('Project created successfully');

    // Verify new project appears in list
    const newProjectElement = await page.$(`[data-testid="project-${mockProject.name}"]`);
    expect(newProjectElement).toBeTruthy();
  });

  test('should update existing project', async ({ page }) => {
    // Create test project
    const project = await createProject(mockProject);
    
    // Click edit button for project
    await page.click(`[data-testid="edit-project-${project.id}"]`);

    // Update project details
    const updatedName = 'Updated Project Name';
    await page.fill('[data-testid="project-name-input"]', updatedName);

    // Submit update
    await page.click('[data-testid="update-project-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toHaveText('Project updated successfully');

    // Verify project name is updated in list
    const updatedProjectName = await page.textContent(`[data-testid="project-name-${project.id}"]`);
    expect(updatedProjectName).toBe(updatedName);
  });

  test('should delete project', async ({ page }) => {
    // Create test project
    const project = await createProject(mockProject);
    
    // Click delete button
    await page.click(`[data-testid="delete-project-${project.id}"]`);

    // Confirm deletion in modal
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toHaveText('Project deleted successfully');

    // Verify project is removed from list
    const deletedProject = await page.$(`[data-testid="project-${project.id}"]`);
    expect(deletedProject).toBeNull();
  });

  test('should handle project creation validation errors', async ({ page }) => {
    // Click create project button
    await page.click('[data-testid="create-project-button"]');
    
    // Submit empty form
    await page.click('[data-testid="submit-project-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="name-error"]')).toHaveText('Project name is required');
    
    await expect(page.locator('[data-testid="dates-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="dates-error"]')).toHaveText('Start and end dates are required');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error response
    server.use(
      mockGetTasksHandler.mockImplementationOnce((req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: 'Internal server error' })
        );
      })
    );

    // Reload page to trigger error
    await page.reload();

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Failed to load projects. Please try again.');
  });
});