/**
 * @fileoverview Project service implementation for managing Project entities
 * 
 * Requirements Addressed:
 * - Project Management Logic (Technical Specification/System Architecture/Core Components)
 *   Implements the business logic for managing projects, including creation, retrieval, 
 *   updating, and deletion.
 * 
 * Human Tasks:
 * - Configure database connection settings in production environment
 * - Set up monitoring for project-related operations
 * - Configure audit logging for project changes
 * - Review and update project validation rules as needed
 */

import { ProjectRepository } from '../repositories/project.repository';
import { validateProject } from '../validators/project.validator';
import { BaseService } from '../../../shared/interfaces/base-service.interface';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/utils/error-handler';
import { Project } from '../models/project.model';
import { PaginatedResult } from '../../../shared/types/common.types';
import { ERROR_CODES } from '../../../shared/constants/error-codes';

/**
 * Service class implementing business logic for Project entity management.
 * Implements BaseService interface to ensure standardized CRUD operations.
 */
export class ProjectService implements BaseService<Project> {
    /**
     * Creates a new instance of ProjectService
     * @param projectRepository - Repository instance for data access
     */
    constructor(private readonly projectRepository: ProjectRepository) {}

    /**
     * Creates a new project after validating the input data
     * @param projectData - The project data to create
     * @returns Promise resolving to the created Project entity
     * @throws {ValidationError} If project data is invalid
     * @throws {DatabaseError} If creation fails
     */
    async create(projectData: Project): Promise<Project> {
        try {
            // Validate project data
            const validationError = validateProject(projectData);
            if (validationError) {
                logger.logError(validationError);
                throw validationError;
            }

            // Create project in repository
            const createdProject = await this.projectRepository.create(projectData);
            
            // Log successful creation
            logger.logInfo(`Project created successfully: ${createdProject.id}`);
            
            return createdProject;
        } catch (error) {
            const errorResponse = {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to create project: ${error.message}`,
                details: error
            };
            logger.logError(errorResponse);
            throw errorResponse;
        }
    }

    /**
     * Retrieves a project by its unique identifier
     * @param id - The unique identifier of the project
     * @returns Promise resolving to the Project entity if found, null otherwise
     * @throws {DatabaseError} If retrieval fails
     */
    async findById(id: string): Promise<Project | null> {
        try {
            const project = await this.projectRepository.findById(id);
            
            if (project) {
                logger.logInfo(`Project retrieved successfully: ${id}`);
            } else {
                logger.logInfo(`Project not found: ${id}`);
            }
            
            return project;
        } catch (error) {
            const errorResponse = {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve project: ${error.message}`,
                details: error
            };
            logger.logError(errorResponse);
            throw errorResponse;
        }
    }

    /**
     * Updates an existing project with partial data
     * @param id - The unique identifier of the project to update
     * @param updates - Partial project data containing only the properties to update
     * @returns Promise resolving to the updated Project entity
     * @throws {ValidationError} If update data is invalid
     * @throws {NotFoundError} If project doesn't exist
     * @throws {DatabaseError} If update fails
     */
    async update(id: string, updates: Partial<Project>): Promise<Project> {
        try {
            // Validate update data
            const validationError = validateProject({ ...updates, id });
            if (validationError) {
                logger.logError(validationError);
                throw validationError;
            }

            // Update project in repository
            const updatedProject = await this.projectRepository.update(id, updates);
            
            // Log successful update
            logger.logInfo(`Project updated successfully: ${id}`);
            
            return updatedProject;
        } catch (error) {
            const errorResponse = {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to update project: ${error.message}`,
                details: error
            };
            logger.logError(errorResponse);
            throw errorResponse;
        }
    }

    /**
     * Deletes a project by its unique identifier
     * @param id - The unique identifier of the project to delete
     * @returns Promise resolving to true if deletion was successful
     * @throws {NotFoundError} If project doesn't exist
     * @throws {DatabaseError} If deletion fails
     */
    async delete(id: string): Promise<boolean> {
        try {
            const deleted = await this.projectRepository.delete(id);
            
            if (deleted) {
                logger.logInfo(`Project deleted successfully: ${id}`);
            } else {
                logger.logInfo(`Project not found for deletion: ${id}`);
            }
            
            return deleted;
        } catch (error) {
            const errorResponse = {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to delete project: ${error.message}`,
                details: error
            };
            logger.logError(errorResponse);
            throw errorResponse;
        }
    }

    /**
     * Retrieves a paginated list of projects
     * @param page - The page number to retrieve (1-based)
     * @param pageSize - The number of items per page
     * @returns Promise resolving to a paginated result containing the Project entities
     * @throws {ValidationError} If pagination parameters are invalid
     * @throws {DatabaseError} If retrieval fails
     */
    async findAll(page: number, pageSize: number): Promise<PaginatedResult<Project>> {
        try {
            // Validate pagination parameters
            if (page < 1 || pageSize < 1) {
                const validationError = {
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid pagination parameters',
                    details: { page, pageSize }
                };
                logger.logError(validationError);
                throw validationError;
            }

            // Retrieve paginated projects from repository
            const result = await this.projectRepository.findAll(page, pageSize);
            
            // Log successful retrieval
            logger.logInfo(`Retrieved ${result.items.length} projects (page ${page})`);
            
            return result;
        } catch (error) {
            const errorResponse = {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve projects: ${error.message}`,
                details: error
            };
            logger.logError(errorResponse);
            throw errorResponse;
        }
    }
}