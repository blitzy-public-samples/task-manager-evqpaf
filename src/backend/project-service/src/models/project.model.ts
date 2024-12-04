/**
 * @fileoverview Project model definition representing the core project entity
 * 
 * Requirements Addressed:
 * - Project Data Management (Technical Specification/System Design/Database Design/Schema Design)
 *   Ensures the structure and integrity of project data within the system.
 */

import { BaseRepository } from '../../shared/interfaces/base-repository.interface';
import { PaginatedResult } from '../../shared/types/common.types';
import { STATUS_CODES } from '../../shared/constants/status-codes';

/**
 * Represents a project entity in the system with its core properties and behaviors.
 * Implements data validation and serialization for project-related operations.
 */
export class Project {
    /**
     * Unique identifier for the project
     */
    public readonly id: string;

    /**
     * Name of the project
     */
    public readonly name: string;

    /**
     * Detailed description of the project
     */
    public readonly description: string;

    /**
     * Project start date
     */
    public readonly startDate: Date;

    /**
     * Project end date
     */
    public readonly endDate: Date;

    /**
     * Array of team member IDs associated with the project
     */
    public readonly teamMembers: string[];

    /**
     * Creates a new Project instance with the specified properties
     * 
     * @param id - Unique identifier for the project
     * @param name - Name of the project
     * @param description - Detailed description of the project
     * @param startDate - Project start date
     * @param endDate - Project end date
     * @param teamMembers - Array of team member IDs
     */
    constructor(
        id: string,
        name: string,
        description: string,
        startDate: Date,
        endDate: Date,
        teamMembers: string[]
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.teamMembers = teamMembers;
    }

    /**
     * Converts the Project instance to a plain JavaScript object
     * suitable for JSON serialization and API responses
     * 
     * @returns A JSON-compatible representation of the Project
     */
    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            startDate: this.startDate.toISOString(),
            endDate: this.endDate.toISOString(),
            teamMembers: this.teamMembers
        };
    }
}