// jest v29.0.0
import { describe, beforeAll, afterEach, it, expect } from '@jest/globals';
// supertest v6.3.3
import request from 'supertest';

import { initializeDatabase } from '../../src/config/database.config';
import { UserModel } from '../../src/models/user.model';
import { UserRepository } from '../../src/repositories/user.repository';
import { UserService } from '../../src/services/user.service';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/utils/error-handler';
import { STATUS_CODES } from '../../../shared/constants/status-codes';
import { ERROR_CODES } from '../../../shared/constants/error-codes';

/**
 * Human Tasks:
 * - Ensure test database configuration is properly set up in environment
 * - Configure test data cleanup policies
 * - Set up test coverage reporting
 * - Review and maintain test data fixtures
 */

describe('User Service Integration Tests', () => {
    let userRepository: UserRepository;
    let userService: UserService;
    let testUser: UserModel;

    // Setup database connection before all tests
    beforeAll(async () => {
        try {
            await initializeDatabase();
            userRepository = new UserRepository(global.dbConnection);
            userService = new UserService(userRepository);
            logger.logInfo('Test database initialized successfully');
        } catch (error) {
            logger.logError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Failed to initialize test database',
                details: error
            });
            throw error;
        }
    });

    // Clean up test data after each test
    afterEach(async () => {
        try {
            if (testUser?.id) {
                await userRepository.delete(testUser.id);
            }
            logger.logInfo('Test data cleaned up successfully');
        } catch (error) {
            logger.logError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Failed to clean up test data',
                details: error
            });
        }
    });

    describe('Create User', () => {
        it('should successfully create a new user', async () => {
            // Arrange
            const userData = new UserModel(
                '12345',
                'test@example.com',
                'hashedPassword123',
                'John',
                'Doe',
                true,
                'user-role-1',
                new Date(),
                new Date()
            );

            try {
                // Act
                testUser = await userService.create(userData);

                // Assert
                expect(testUser).toBeDefined();
                expect(testUser.id).toBeDefined();
                expect(testUser.email).toBe(userData.email);
                expect(testUser.firstName).toBe(userData.firstName);
                expect(testUser.lastName).toBe(userData.lastName);
                expect(testUser.isActive).toBe(userData.isActive);
                expect(testUser.roleId).toBe(userData.roleId);

                // Verify the user was actually persisted
                const persistedUser = await userService.findById(testUser.id);
                expect(persistedUser).toBeDefined();
                expect(persistedUser?.toJSON()).toEqual(testUser.toJSON());

            } catch (error) {
                handleError(error, global.mockResponse);
                throw error;
            }
        });

        it('should fail to create user with invalid data', async () => {
            // Arrange
            const invalidUserData = new UserModel(
                '12345',
                'invalid-email', // Invalid email format
                'hashedPassword123',
                '', // Invalid empty first name
                'Doe',
                true,
                'user-role-1',
                new Date(),
                new Date()
            );

            try {
                // Act
                await userService.create(invalidUserData);
                fail('Expected validation error');
            } catch (error: any) {
                // Assert
                expect(error.message).toBeDefined();
                expect(error.message).toContain(ERROR_CODES.VALIDATION_ERROR);
            }
        });
    });

    describe('Get User by ID', () => {
        it('should successfully retrieve an existing user', async () => {
            // Arrange
            const userData = new UserModel(
                '12345',
                'test@example.com',
                'hashedPassword123',
                'John',
                'Doe',
                true,
                'user-role-1',
                new Date(),
                new Date()
            );

            try {
                // Create test user
                testUser = await userService.create(userData);

                // Act
                const retrievedUser = await userService.findById(testUser.id);

                // Assert
                expect(retrievedUser).toBeDefined();
                expect(retrievedUser?.id).toBe(testUser.id);
                expect(retrievedUser?.email).toBe(testUser.email);
                expect(retrievedUser?.firstName).toBe(testUser.firstName);
                expect(retrievedUser?.lastName).toBe(testUser.lastName);
                expect(retrievedUser?.isActive).toBe(testUser.isActive);
                expect(retrievedUser?.roleId).toBe(testUser.roleId);

            } catch (error) {
                handleError(error, global.mockResponse);
                throw error;
            }
        });

        it('should return null for non-existent user ID', async () => {
            try {
                // Act
                const result = await userService.findById('non-existent-id');

                // Assert
                expect(result).toBeNull();

            } catch (error) {
                handleError(error, global.mockResponse);
                throw error;
            }
        });
    });

    describe('Update User', () => {
        it('should successfully update an existing user', async () => {
            // Arrange
            const userData = new UserModel(
                '12345',
                'test@example.com',
                'hashedPassword123',
                'John',
                'Doe',
                true,
                'user-role-1',
                new Date(),
                new Date()
            );

            try {
                // Create test user
                testUser = await userService.create(userData);

                // Act
                const updates = {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    isActive: false
                };
                const updatedUser = await userService.update(testUser.id, updates);

                // Assert
                expect(updatedUser).toBeDefined();
                expect(updatedUser.id).toBe(testUser.id);
                expect(updatedUser.firstName).toBe(updates.firstName);
                expect(updatedUser.lastName).toBe(updates.lastName);
                expect(updatedUser.isActive).toBe(updates.isActive);
                expect(updatedUser.email).toBe(testUser.email); // Unchanged field

                // Verify the updates were persisted
                const persistedUser = await userService.findById(testUser.id);
                expect(persistedUser?.toJSON()).toEqual(updatedUser.toJSON());

            } catch (error) {
                handleError(error, global.mockResponse);
                throw error;
            }
        });
    });

    describe('Delete User', () => {
        it('should successfully delete an existing user', async () => {
            // Arrange
            const userData = new UserModel(
                '12345',
                'test@example.com',
                'hashedPassword123',
                'John',
                'Doe',
                true,
                'user-role-1',
                new Date(),
                new Date()
            );

            try {
                // Create test user
                testUser = await userService.create(userData);

                // Act
                const result = await userService.delete(testUser.id);

                // Assert
                expect(result).toBe(true);

                // Verify the user was actually deleted
                const deletedUser = await userService.findById(testUser.id);
                expect(deletedUser).toBeNull();

                // Clear testUser reference since it's already deleted
                testUser = null as any;

            } catch (error) {
                handleError(error, global.mockResponse);
                throw error;
            }
        });

        it('should return false when deleting non-existent user', async () => {
            try {
                // Act
                const result = await userService.delete('non-existent-id');

                // Assert
                expect(result).toBe(false);

            } catch (error) {
                handleError(error, global.mockResponse);
                throw error;
            }
        });
    });

    describe('Find All Users', () => {
        it('should successfully retrieve paginated users', async () => {
            // Arrange
            const userData1 = new UserModel(
                '12345',
                'test1@example.com',
                'hashedPassword123',
                'John',
                'Doe',
                true,
                'user-role-1',
                new Date(),
                new Date()
            );

            const userData2 = new UserModel(
                '67890',
                'test2@example.com',
                'hashedPassword456',
                'Jane',
                'Smith',
                true,
                'user-role-1',
                new Date(),
                new Date()
            );

            try {
                // Create test users
                await userService.create(userData1);
                await userService.create(userData2);

                // Act
                const result = await userService.findAll(1, 10);

                // Assert
                expect(result).toBeDefined();
                expect(result.items).toBeInstanceOf(Array);
                expect(result.total).toBeGreaterThanOrEqual(2);
                expect(result.page).toBe(1);
                expect(result.pageSize).toBe(10);

                // Clean up
                await userService.delete(userData1.id);
                await userService.delete(userData2.id);

            } catch (error) {
                handleError(error, global.mockResponse);
                throw error;
            }
        });
    });
});