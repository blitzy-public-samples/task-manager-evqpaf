/**
 * @fileoverview User Repository Implementation
 * 
 * Requirements Addressed:
 * - User Management (Technical Specification/System Design/Database Design/Schema Design)
 *   Provides a structured and standardized way to interact with the User data in the database.
 * 
 * Human Tasks:
 * - Ensure database connection configuration is properly set up
 * - Verify database indexes are created for optimal query performance
 * - Configure database connection pool settings based on load requirements
 */

import { BaseRepository } from '../../shared/interfaces/base-repository.interface';
import { UserModel } from '../models/user.model';
import { PaginatedResult } from '../../shared/interfaces/base-repository.interface';
import { ERROR_CODES } from '../../shared/constants/error-codes';

/**
 * Repository class handling all database operations for User entities.
 * Implements the BaseRepository interface to ensure standardized CRUD operations.
 */
export class UserRepository implements BaseRepository<UserModel> {
    /**
     * Creates a new instance of UserRepository
     * @param dbConnection Database connection instance for executing queries
     */
    constructor(private readonly dbConnection: DatabaseConnection) {}

    /**
     * Creates a new User entity in the database
     * @param user The user model instance to create
     * @returns Promise resolving to the created user
     * @throws Error if validation fails or database operation fails
     */
    async create(user: UserModel): Promise<UserModel> {
        try {
            // Validate the user model before creation
            user.validate();

            // Create database transaction
            const transaction = await this.dbConnection.startTransaction();

            try {
                // Insert user data into database
                const result = await transaction.query(
                    'INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, role_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                    [
                        user.id,
                        user.email,
                        user.passwordHash,
                        user.firstName,
                        user.lastName,
                        user.isActive,
                        user.roleId,
                        user.createdAt,
                        user.updatedAt
                    ]
                );

                await transaction.commit();

                // Convert database result to UserModel instance
                return new UserModel(
                    result.id,
                    result.email,
                    result.password_hash,
                    result.first_name,
                    result.last_name,
                    result.is_active,
                    result.role_id,
                    result.created_at,
                    result.updated_at
                );
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    /**
     * Finds a user by their unique identifier
     * @param id The unique identifier of the user
     * @returns Promise resolving to the user if found, null otherwise
     */
    async findById(id: string): Promise<UserModel | null> {
        try {
            const result = await this.dbConnection.query(
                'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
                [id]
            );

            if (!result || result.length === 0) {
                return null;
            }

            return new UserModel(
                result.id,
                result.email,
                result.password_hash,
                result.first_name,
                result.last_name,
                result.is_active,
                result.role_id,
                result.created_at,
                result.updated_at
            );
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    /**
     * Updates an existing user in the database
     * @param id The unique identifier of the user to update
     * @param updates Partial user object containing only the properties to update
     * @returns Promise resolving to the updated user
     * @throws Error if user not found or update fails
     */
    async update(id: string, updates: Partial<UserModel>): Promise<UserModel> {
        try {
            const currentUser = await this.findById(id);
            if (!currentUser) {
                throw new Error(ERROR_CODES.RESOURCE_NOT_FOUND);
            }

            // Create update query dynamically based on provided updates
            const updateFields: string[] = [];
            const values: any[] = [];
            let paramCount = 1;

            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined && key !== 'id' && key !== 'createdAt') {
                    updateFields.push(`${this.toSnakeCase(key)} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });

            values.push(id);
            const updateQuery = `
                UPDATE users 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $${paramCount} 
                RETURNING *
            `;

            const result = await this.dbConnection.query(updateQuery, values);

            return new UserModel(
                result.id,
                result.email,
                result.password_hash,
                result.first_name,
                result.last_name,
                result.is_active,
                result.role_id,
                result.created_at,
                result.updated_at
            );
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    /**
     * Soft deletes a user by setting deleted_at timestamp
     * @param id The unique identifier of the user to delete
     * @returns Promise resolving to true if deletion was successful
     */
    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.dbConnection.query(
                'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
                [id]
            );

            return result.rowCount > 0;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    /**
     * Retrieves a paginated list of active users
     * @param page The page number (1-based)
     * @param pageSize The number of items per page
     * @returns Promise resolving to a paginated result containing users
     */
    async findAll(page: number, pageSize: number): Promise<PaginatedResult<UserModel>> {
        try {
            // Calculate offset
            const offset = (page - 1) * pageSize;

            // Get total count of active users
            const countResult = await this.dbConnection.query(
                'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL'
            );
            const total = parseInt(countResult.total);

            // Get paginated users
            const results = await this.dbConnection.query(
                'SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
                [pageSize, offset]
            );

            // Convert results to UserModel instances
            const users = results.map(result => new UserModel(
                result.id,
                result.email,
                result.password_hash,
                result.first_name,
                result.last_name,
                result.is_active,
                result.role_id,
                result.created_at,
                result.updated_at
            ));

            return {
                items: users,
                total,
                page,
                pageSize
            };
        } catch (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }

    /**
     * Converts camelCase string to snake_case for database operations
     * @param str The string to convert
     * @returns The converted string in snake_case
     */
    private toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
}