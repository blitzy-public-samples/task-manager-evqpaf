/**
 * @fileoverview User Service Implementation
 * 
 * Requirements Addressed:
 * - User Management (Technical Specification/System Design/Database Design/Schema Design)
 *   Provides business logic and interaction with the User repository for managing User entities.
 * 
 * Human Tasks:
 * - Ensure proper configuration of user validation rules
 * - Review and configure user-related business rules
 * - Set up monitoring for critical user operations
 */

import { BaseService } from '../../../shared/interfaces/base-service.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserModel } from '../models/user.model';
import { PaginatedResult } from '../../../shared/interfaces/base-repository.interface';
import { handleError } from '../../../shared/utils/error-handler';
import { logger } from '../../../shared/utils/logger';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';

/**
 * Service class implementing business logic for User entity management.
 * Implements BaseService interface to ensure standardized CRUD operations.
 */
export class UserService implements BaseService<UserModel> {
    /**
     * Creates a new instance of UserService
     * @param userRepository - Repository instance for User entity operations
     */
    constructor(private readonly userRepository: UserRepository) {}

    /**
     * Creates a new User entity
     * @param user - The user entity to create
     * @returns Promise resolving to the created user
     * @throws Error if validation fails or creation fails
     */
    async create(user: UserModel): Promise<UserModel> {
        try {
            // Validate user data before creation
            user.validate();

            // Log user creation attempt
            logger.logInfo(`Attempting to create user with email: ${user.email}`);

            // Delegate creation to repository
            const createdUser = await this.userRepository.create(user);

            // Log successful creation
            logger.logInfo(`Successfully created user with ID: ${createdUser.id}`);

            return createdUser;
        } catch (error) {
            logger.logError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: `Failed to create user: ${error.message}`,
                details: error
            });
            throw error;
        }
    }

    /**
     * Retrieves a User entity by ID
     * @param id - The unique identifier of the user
     * @returns Promise resolving to the user if found, null otherwise
     */
    async findById(id: string): Promise<UserModel | null> {
        try {
            logger.logInfo(`Attempting to find user with ID: ${id}`);
            const user = await this.userRepository.findById(id);

            if (!user) {
                logger.logInfo(`User not found with ID: ${id}`);
                return null;
            }

            return user;
        } catch (error) {
            logger.logError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to find user: ${error.message}`,
                details: error
            });
            throw error;
        }
    }

    /**
     * Updates an existing User entity
     * @param id - The unique identifier of the user to update
     * @param updates - Partial user object containing only the properties to update
     * @returns Promise resolving to the updated user
     * @throws Error if user not found or update fails
     */
    async update(id: string, updates: Partial<UserModel>): Promise<UserModel> {
        try {
            // Check if user exists
            const existingUser = await this.findById(id);
            if (!existingUser) {
                const error = new Error(`User not found with ID: ${id}`);
                logger.logError({
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    message: error.message,
                    details: { userId: id }
                });
                throw error;
            }

            // Log update attempt
            logger.logInfo(`Attempting to update user with ID: ${id}`);

            // Validate updated data
            const updatedUser = new UserModel(
                existingUser.id,
                updates.email || existingUser.email,
                updates.passwordHash || existingUser.passwordHash,
                updates.firstName || existingUser.firstName,
                updates.lastName || existingUser.lastName,
                typeof updates.isActive === 'boolean' ? updates.isActive : existingUser.isActive,
                updates.roleId || existingUser.roleId,
                existingUser.createdAt,
                new Date()
            );
            updatedUser.validate();

            // Delegate update to repository
            const result = await this.userRepository.update(id, updates);

            // Log successful update
            logger.logInfo(`Successfully updated user with ID: ${id}`);

            return result;
        } catch (error) {
            logger.logError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to update user: ${error.message}`,
                details: error
            });
            throw error;
        }
    }

    /**
     * Deletes a User entity
     * @param id - The unique identifier of the user to delete
     * @returns Promise resolving to true if deletion was successful
     * @throws Error if user not found or deletion fails
     */
    async delete(id: string): Promise<boolean> {
        try {
            // Check if user exists
            const existingUser = await this.findById(id);
            if (!existingUser) {
                const error = new Error(`User not found with ID: ${id}`);
                logger.logError({
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    message: error.message,
                    details: { userId: id }
                });
                throw error;
            }

            // Log deletion attempt
            logger.logInfo(`Attempting to delete user with ID: ${id}`);

            // Delegate deletion to repository
            const result = await this.userRepository.delete(id);

            // Log successful deletion
            if (result) {
                logger.logInfo(`Successfully deleted user with ID: ${id}`);
            }

            return result;
        } catch (error) {
            logger.logError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to delete user: ${error.message}`,
                details: error
            });
            throw error;
        }
    }

    /**
     * Retrieves a paginated list of User entities
     * @param page - The page number (1-based)
     * @param pageSize - The number of items per page
     * @returns Promise resolving to a paginated result containing users
     * @throws Error if retrieval fails
     */
    async findAll(page: number, pageSize: number): Promise<PaginatedResult<UserModel>> {
        try {
            // Validate pagination parameters
            if (page < 1 || pageSize < 1) {
                throw new Error('Invalid pagination parameters');
            }

            // Log retrieval attempt
            logger.logInfo(`Attempting to retrieve users (page: ${page}, pageSize: ${pageSize})`);

            // Delegate retrieval to repository
            const result = await this.userRepository.findAll(page, pageSize);

            // Log successful retrieval
            logger.logInfo(`Successfully retrieved ${result.items.length} users`);

            return result;
        } catch (error) {
            logger.logError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve users: ${error.message}`,
                details: error
            });
            throw error;
        }
    }
}