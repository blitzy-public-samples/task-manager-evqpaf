/**
 * @fileoverview Unit tests for ProjectService class
 * 
 * Requirements Addressed:
 * - Unit Testing for Project Service (Technical Specification/System Design/Testing Standards)
 *   Ensures the correctness of the ProjectService methods and their interactions with dependencies.
 * 
 * Human Tasks:
 * - Review test coverage and add additional test cases as needed
 * - Configure test environment variables if required
 * - Set up continuous integration to run these tests automatically
 */

// jest v29.0.0
import { ProjectService } from '../../src/services/project.service';
import { ProjectRepository } from '../../src/repositories/project.repository';
import { Project } from '../../src/models/project.model';
import { logger } from '../../../shared/utils/logger';
import { ERROR_CODES } from '../../../shared/constants/error-codes';

// Mock dependencies
jest.mock('../../src/repositories/project.repository');
jest.mock('../../../shared/utils/logger');
jest.mock('../../src/models/project.model');

describe('ProjectService', () => {
    let projectService: ProjectService;
    let projectRepository: jest.Mocked<ProjectRepository>;

    // Test data
    const mockProject = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Project',
        description: 'Test Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        teamMembers: ['user1', 'user2'],
        status: 'ACTIVE',
        ownerId: '123e4567-e89b-12d3-a456-426614174001'
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Initialize mocked repository
        projectRepository = new ProjectRepository(null) as jest.Mocked<ProjectRepository>;
        
        // Initialize service with mocked repository
        projectService = new ProjectService(projectRepository);
    });

    describe('create', () => {
        it('should successfully create a project', async () => {
            // Arrange
            const projectData = new Project(
                mockProject.id,
                mockProject.name,
                mockProject.description,
                mockProject.startDate,
                mockProject.endDate,
                mockProject.teamMembers
            );
            projectRepository.create.mockResolvedValue(projectData);

            // Act
            const result = await projectService.create(projectData);

            // Assert
            expect(projectRepository.create).toHaveBeenCalledWith(projectData);
            expect(result).toBe(projectData);
            expect(logger.logInfo).toHaveBeenCalledWith(
                expect.stringContaining('Project created successfully')
            );
        });

        it('should handle validation error during creation', async () => {
            // Arrange
            const invalidProject = new Project(
                '',
                '',
                '',
                new Date(),
                new Date(),
                []
            );

            // Act & Assert
            await expect(projectService.create(invalidProject))
                .rejects
                .toMatchObject({
                    code: ERROR_CODES.VALIDATION_ERROR
                });
            expect(projectRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should successfully retrieve a project by id', async () => {
            // Arrange
            const projectId = mockProject.id;
            const projectData = new Project(
                mockProject.id,
                mockProject.name,
                mockProject.description,
                mockProject.startDate,
                mockProject.endDate,
                mockProject.teamMembers
            );
            projectRepository.findById.mockResolvedValue(projectData);

            // Act
            const result = await projectService.findById(projectId);

            // Assert
            expect(projectRepository.findById).toHaveBeenCalledWith(projectId);
            expect(result).toBe(projectData);
            expect(logger.logInfo).toHaveBeenCalledWith(
                expect.stringContaining('Project retrieved successfully')
            );
        });

        it('should return null for non-existent project', async () => {
            // Arrange
            const projectId = 'non-existent-id';
            projectRepository.findById.mockResolvedValue(null);

            // Act
            const result = await projectService.findById(projectId);

            // Assert
            expect(result).toBeNull();
            expect(logger.logInfo).toHaveBeenCalledWith(
                expect.stringContaining('Project not found')
            );
        });
    });

    describe('update', () => {
        it('should successfully update a project', async () => {
            // Arrange
            const projectId = mockProject.id;
            const updates = {
                name: 'Updated Project Name',
                description: 'Updated Description'
            };
            const updatedProject = new Project(
                mockProject.id,
                updates.name,
                updates.description,
                mockProject.startDate,
                mockProject.endDate,
                mockProject.teamMembers
            );
            projectRepository.update.mockResolvedValue(updatedProject);

            // Act
            const result = await projectService.update(projectId, updates);

            // Assert
            expect(projectRepository.update).toHaveBeenCalledWith(projectId, updates);
            expect(result).toBe(updatedProject);
            expect(logger.logInfo).toHaveBeenCalledWith(
                expect.stringContaining('Project updated successfully')
            );
        });

        it('should handle validation error during update', async () => {
            // Arrange
            const projectId = mockProject.id;
            const invalidUpdates = {
                name: '' // Invalid empty name
            };

            // Act & Assert
            await expect(projectService.update(projectId, invalidUpdates))
                .rejects
                .toMatchObject({
                    code: ERROR_CODES.VALIDATION_ERROR
                });
            expect(projectRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should successfully delete a project', async () => {
            // Arrange
            const projectId = mockProject.id;
            projectRepository.delete.mockResolvedValue(true);

            // Act
            const result = await projectService.delete(projectId);

            // Assert
            expect(projectRepository.delete).toHaveBeenCalledWith(projectId);
            expect(result).toBe(true);
            expect(logger.logInfo).toHaveBeenCalledWith(
                expect.stringContaining('Project deleted successfully')
            );
        });

        it('should handle non-existent project deletion', async () => {
            // Arrange
            const projectId = 'non-existent-id';
            projectRepository.delete.mockResolvedValue(false);

            // Act
            const result = await projectService.delete(projectId);

            // Assert
            expect(result).toBe(false);
            expect(logger.logInfo).toHaveBeenCalledWith(
                expect.stringContaining('Project not found for deletion')
            );
        });
    });

    describe('findAll', () => {
        it('should successfully retrieve paginated projects', async () => {
            // Arrange
            const page = 1;
            const pageSize = 10;
            const mockPaginatedResult = {
                items: [new Project(
                    mockProject.id,
                    mockProject.name,
                    mockProject.description,
                    mockProject.startDate,
                    mockProject.endDate,
                    mockProject.teamMembers
                )],
                total: 1,
                page: 1,
                pageSize: 10
            };
            projectRepository.findAll.mockResolvedValue(mockPaginatedResult);

            // Act
            const result = await projectService.findAll(page, pageSize);

            // Assert
            expect(projectRepository.findAll).toHaveBeenCalledWith(page, pageSize);
            expect(result).toBe(mockPaginatedResult);
            expect(logger.logInfo).toHaveBeenCalledWith(
                expect.stringContaining('Retrieved')
            );
        });

        it('should handle invalid pagination parameters', async () => {
            // Arrange
            const invalidPage = 0;
            const invalidPageSize = -1;

            // Act & Assert
            await expect(projectService.findAll(invalidPage, invalidPageSize))
                .rejects
                .toMatchObject({
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: expect.stringContaining('Invalid pagination parameters')
                });
            expect(projectRepository.findAll).not.toHaveBeenCalled();
        });
    });
});