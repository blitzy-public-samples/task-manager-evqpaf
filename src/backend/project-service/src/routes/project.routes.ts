/**
 * @fileoverview Project routes implementation for handling project-related API endpoints
 * 
 * Requirements Addressed:
 * - Project Management API (Technical Specification/System Design/API Design)
 *   Implements API endpoints for creating, retrieving, updating, and deleting projects,
 *   ensuring proper validation and response formatting.
 * 
 * Human Tasks:
 * - Configure rate limiting for project endpoints
 * - Set up monitoring for API usage patterns
 * - Review and update API documentation
 * - Configure CORS settings for production
 */

// express v4.18.2
import { Router } from 'express';

// Import controllers and middleware
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../../../api-gateway/src/middleware/auth.middleware';
import { validationMiddleware } from '../../../api-gateway/src/middleware/validation.middleware';
import { validateProject } from '../validators/project.validator';

// Create Express router instance
const router = Router();

// Initialize ProjectController
const projectController = new ProjectController();

/**
 * POST /projects
 * Create a new project
 * Requires authentication and validates project data
 */
router.post(
    '/',
    authMiddleware(['admin', 'project_manager']),
    validationMiddleware(validateProject),
    projectController.createProject.bind(projectController)
);

/**
 * GET /projects/:id
 * Retrieve a project by ID
 * Requires authentication
 */
router.get(
    '/:id',
    authMiddleware(['admin', 'project_manager', 'developer']),
    projectController.getProjectById.bind(projectController)
);

/**
 * PUT /projects/:id
 * Update an existing project
 * Requires authentication and validates update data
 */
router.put(
    '/:id',
    authMiddleware(['admin', 'project_manager']),
    validationMiddleware(validateProject),
    projectController.updateProject.bind(projectController)
);

/**
 * DELETE /projects/:id
 * Delete a project
 * Requires authentication with admin privileges
 */
router.delete(
    '/:id',
    authMiddleware(['admin']),
    projectController.deleteProject.bind(projectController)
);

/**
 * GET /projects
 * List all projects with pagination
 * Requires authentication
 */
router.get(
    '/',
    authMiddleware(['admin', 'project_manager', 'developer']),
    projectController.listProjects.bind(projectController)
);

// Export the configured router
export default router;