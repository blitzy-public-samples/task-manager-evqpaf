/**
 * @fileoverview User Model Definition
 * 
 * Requirements Addressed:
 * - User Management (Technical Specification/System Design/Database Design/Schema Design)
 *   Provides a structured representation of user data, including fields for authentication,
 *   roles, and metadata.
 * 
 * Human Tasks:
 * - Ensure password hashing mechanism is properly configured in the authentication service
 * - Verify role IDs align with the role management system configuration
 * - Review and configure user activation workflow if required
 */

import { BaseRepository } from '../../shared/interfaces/base-repository.interface';
import { PaginatedResult } from '../../shared/types/common.types';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';

/**
 * Represents a user entity in the system with all associated data and metadata.
 * Implements core user management functionality as specified in the technical requirements.
 */
export class UserModel {
    /**
     * Creates a new instance of the UserModel class.
     * 
     * @param id - Unique identifier for the user
     * @param email - User's email address (used for authentication)
     * @param passwordHash - Hashed version of the user's password
     * @param firstName - User's first name
     * @param lastName - User's last name
     * @param isActive - Flag indicating if the user account is active
     * @param roleId - ID of the role assigned to the user
     * @param createdAt - Timestamp of user creation
     * @param updatedAt - Timestamp of last user update
     */
    constructor(
        public readonly id: string,
        public email: string,
        public passwordHash: string,
        public firstName: string,
        public lastName: string,
        public isActive: boolean,
        public roleId: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {}

    /**
     * Converts the UserModel instance to a JSON object, excluding sensitive information.
     * This method is used when sending user data to clients or logging.
     * 
     * @returns A sanitized JSON representation of the user object
     */
    public toJSON(): Record<string, any> {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            isActive: this.isActive,
            roleId: this.roleId,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
            // Note: passwordHash is intentionally excluded for security
        };
    }

    /**
     * Gets the user's full name by combining first and last name.
     * 
     * @returns The full name of the user
     */
    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    /**
     * Validates the user model's required fields and data formats.
     * 
     * @throws Error with VALIDATION_ERROR code if validation fails
     */
    public validate(): void {
        if (!this.email || !this.email.includes('@')) {
            throw new Error(ERROR_CODES.VALIDATION_ERROR);
        }

        if (!this.firstName || !this.lastName) {
            throw new Error(ERROR_CODES.VALIDATION_ERROR);
        }

        if (!this.roleId) {
            throw new Error(ERROR_CODES.VALIDATION_ERROR);
        }
    }
}