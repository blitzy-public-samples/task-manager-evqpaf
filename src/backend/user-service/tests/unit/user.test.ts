/**
 * @fileoverview Unit tests for the UserService class
 * 
 * Requirements Addressed:
 * - User Management (Technical Specification/System Design/Database Design/Schema Design)
 *   Ensures the correctness of user-related business logic and interactions with the UserRepository.
 * 
 * Human Tasks:
 * - Ensure test database is properly configured for integration tests
 * - Verify mock data aligns with production data constraints
 * - Configure test coverage thresholds in jest configuration
 */

// jest v29.0.0
import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { validateUser } from '../../src/validators/user.validator';
import { handleError } from '../../../shared/utils/error-handler';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';

// Mock dependencies
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/validators/user.validator');
jest.mock('../../../shared/utils/error-handler');

describe('UserService', () => {
    let userService: UserService;
    let userRepository: jest.Mocked<UserRepository>;

    // Test data
    const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@company.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNO',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        roleId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Initialize mocked repository
        userRepository = new UserRepository() as jest.Mocked<UserRepository>;
        
        // Initialize service with mocked repository
        userService = new UserService(userRepository);
    });

    describe('createUser', () => {
        it('should successfully create a user', async () => {
            // Arrange
            userRepository.create.mockResolvedValue(mockUser);
            (validateUser as jest.Mock).mockReturnValue(null);

            // Act
            const result = await userService.create(mockUser);

            // Assert
            expect(validateUser).toHaveBeenCalledWith(mockUser);
            expect(userRepository.create).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockUser);
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            const validationError = {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'Validation failed',
                details: [{ path: ['email'], message: 'Invalid email' }]
            };
            (validateUser as jest.Mock).mockReturnValue(validationError);

            // Act & Assert
            await expect(userService.create(mockUser))
                .rejects
                .toThrow('Validation failed');
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {
        it('should successfully retrieve a user by ID', async () => {
            // Arrange
            userRepository.findById.mockResolvedValue(mockUser);

            // Act
            const result = await userService.findById(mockUser.id);

            // Assert
            expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockUser);
        });

        it('should return null when user is not found', async () => {
            // Arrange
            userRepository.findById.mockResolvedValue(null);

            // Act
            const result = await userService.findById('non-existent-id');

            // Assert
            expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        const updates = {
            firstName: 'Jane',
            lastName: 'Smith'
        };

        it('should successfully update a user', async () => {
            // Arrange
            const updatedUser = { ...mockUser, ...updates };
            userRepository.findById.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue(updatedUser);
            (validateUser as jest.Mock).mockReturnValue(null);

            // Act
            const result = await userService.update(mockUser.id, updates);

            // Assert
            expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
            expect(validateUser).toHaveBeenCalled();
            expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updates);
            expect(result).toEqual(updatedUser);
        });

        it('should throw error when user does not exist', async () => {
            // Arrange
            userRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.update(mockUser.id, updates))
                .rejects
                .toThrow(`User not found with ID: ${mockUser.id}`);
            expect(userRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteUser', () => {
        it('should successfully delete a user', async () => {
            // Arrange
            userRepository.findById.mockResolvedValue(mockUser);
            userRepository.delete.mockResolvedValue(true);

            // Act
            const result = await userService.delete(mockUser.id);

            // Assert
            expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
            expect(userRepository.delete).toHaveBeenCalledWith(mockUser.id);
            expect(result).toBe(true);
        });

        it('should throw error when user does not exist', async () => {
            // Arrange
            userRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.delete(mockUser.id))
                .rejects
                .toThrow(`User not found with ID: ${mockUser.id}`);
            expect(userRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('listUsers', () => {
        const mockPaginatedResult = {
            items: [mockUser],
            total: 1,
            page: 1,
            pageSize: 10
        };

        it('should successfully retrieve paginated users', async () => {
            // Arrange
            userRepository.findAll.mockResolvedValue(mockPaginatedResult);

            // Act
            const result = await userService.findAll(1, 10);

            // Assert
            expect(userRepository.findAll).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual(mockPaginatedResult);
        });

        it('should throw error when pagination parameters are invalid', async () => {
            // Act & Assert
            await expect(userService.findAll(0, 10))
                .rejects
                .toThrow('Invalid pagination parameters');
            expect(userRepository.findAll).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle repository errors properly', async () => {
            // Arrange
            const error = new Error('Database error');
            userRepository.create.mockRejectedValue(error);

            // Act & Assert
            await expect(userService.create(mockUser))
                .rejects
                .toThrow('Database error');
            expect(handleError).toHaveBeenCalled();
        });

        it('should handle validation errors properly', async () => {
            // Arrange
            const validationError = {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'Invalid data',
                details: { field: 'email', error: 'Invalid format' }
            };
            (validateUser as jest.Mock).mockReturnValue(validationError);

            // Act & Assert
            await expect(userService.create(mockUser))
                .rejects
                .toThrow('Invalid data');
            expect(handleError).toHaveBeenCalled();
        });
    });
});