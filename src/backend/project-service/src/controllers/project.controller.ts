/**
 * @fileoverview Project controller implementation for handling HTTP requests related to project management
 * 
 * Requirements Addressed:
 * - Project Management API (Technical Specification/System Design/API Design)
 *   Implements API endpoints for creating, retrieving, updating, and deleting projects,
 *   ensuring proper validation and response formatting.
 * 
 * Human Tasks:
 * - Configure rate limiting for API endpoints
 * - Set up API monitoring and analytics
 * - Review and update API documentation
 * - Configure CORS settings for production
 */

// express v4.18.2
import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { validateProject } from '../validators/project.validator';
import { formatSuccessResponse } from '../../../shared/utils/response-formatter';
import { handleError } from '../../../shared/utils/error-handler';
import { logger } from '../../../shared/utils/logger';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';

/**
 * Controller class handling HTTP requests for project-related operations.
 * Implements the Project Management API requirements by providing endpoints
 * for CRUD operations on projects.
 */
export class ProjectController {
    /**
     * Creates a new instance of ProjectController
     * @param projectService - Service instance for handling project business logic
     */
    constructor(private readonly projectService: ProjectService) {}

    /**
     * Handles POST request to create a new project
     * @param req - Express request object containing project data
     * @param res - Express response object
     */
    async createProject(req: Request, res: Response): Promise<void> {
        try {
            logger.logInfo('Creating new project');
            
            // Validate project data
            const validationError = validateProject(req.body);
            if (validationError) {
                handleError(validationError, res);
                return;
            }

            // Create project using service
            const createdProject = await this.projectService.create(req.body);
            
            // Send success response
            res.status(STATUS_CODES.CREATED)
                .json(formatSuccessResponse(createdProject, STATUS_CODES.CREATED));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Handles GET request to retrieve a project by ID
     * @param req - Express request object containing project ID
     * @param res - Express response object
     */
    async getProjectById(req: Request, res: Response): Promise<void> {
        try {
            const projectId = req.params.id;
            logger.logInfo(`Retrieving project with ID: ${projectId}`);

            const project = await this.projectService.findById(projectId);
            
            if (!project) {
                handleError({
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    message: `Project with ID ${projectId} not found`,
                    details: { projectId }
                }, res);
                return;
            }

            res.json(formatSuccessResponse(project));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Handles PUT request to update an existing project
     * @param req - Express request object containing project ID and update data
     * @param res - Express response object
     */
    async updateProject(req: Request, res: Response): Promise<void> {
        try {
            const projectId = req.params.id;
            logger.logInfo(`Updating project with ID: ${projectId}`);

            // Validate update data
            const validationError = validateProject({ ...req.body, id: projectId });
            if (validationError) {
                handleError(validationError, res);
                return;
            }

            // Update project using service
            const updatedProject = await this.projectService.update(projectId, req.body);
            
            res.json(formatSuccessResponse(updatedProject));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Handles DELETE request to remove a project
     * @param req - Express request object containing project ID
     * @param res - Express response object
     */
    async deleteProject(req: Request, res: Response): Promise<void> {
        try {
            const projectId = req.params.id;
            logger.logInfo(`Deleting project with ID: ${projectId}`);

            const deleted = await this.projectService.delete(projectId);
            
            if (!deleted) {
                handleError({
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    message: `Project with ID ${projectId} not found`,
                    details: { projectId }
                }, res);
                return;
            }

            res.json(formatSuccessResponse({ 
                message: 'Project deleted successfully',
                projectId 
            }));
        } catch (error) {
            handleError(error, res);
        }
    }

    /**
     * Handles GET request to retrieve a paginated list of projects
     * @param req - Express request object containing pagination parameters
     * @param res - Express response object
     */
    async listProjects(req: Request, res: Response): Promise<void> {
        try {
            // Extract and validate pagination parameters
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;

            if (page < 1 || pageSize < 1) {
                handleError({
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid pagination parameters',
                    details: { page, pageSize }
                }, res);
                return;
            }

            logger.logInfo(`Retrieving projects page ${page} with size ${pageSize}`);

            const paginatedProjects = await this.projectService.findAll(page, pageSize);
            res.json(formatSuccessResponse(paginatedProjects));
        } catch (error) {
            handleError(error, res);
        }
    }
}