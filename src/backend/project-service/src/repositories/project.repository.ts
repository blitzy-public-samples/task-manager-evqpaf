/**
 * @fileoverview Project repository implementation for managing Project entities
 * 
 * Requirements Addressed:
 * - Project Data Management (Technical Specification/System Design/Database Design/Schema Design)
 *   Ensures the structure and integrity of project data within the system.
 */

import { BaseRepository, PaginatedResult } from '../../shared/interfaces/base-repository.interface';
import { Project } from '../models/project.model';

/**
 * Repository class handling data access operations for Project entities.
 * Implements the BaseRepository interface to ensure standardized CRUD operations.
 */
export class ProjectRepository implements BaseRepository<Project> {
    /**
     * Database connection instance for executing queries
     */
    private readonly dbConnection: DatabaseConnection;

    /**
     * Initializes a new instance of ProjectRepository
     * @param dbConnection - Database connection instance for data access
     */
    constructor(dbConnection: DatabaseConnection) {
        this.dbConnection = dbConnection;
    }

    /**
     * Creates a new Project entity in the database
     * @param project - The Project entity to create
     * @returns Promise resolving to the created Project entity
     */
    async create(project: Project): Promise<Project> {
        try {
            const projectData = project.toJSON();
            const query = `
                INSERT INTO projects (
                    id, name, description, start_date, end_date, team_members
                ) VALUES (
                    $1, $2, $3, $4, $5, $6
                ) RETURNING *
            `;
            
            const values = [
                projectData.id,
                projectData.name,
                projectData.description,
                projectData.startDate,
                projectData.endDate,
                projectData.teamMembers
            ];

            const result = await this.dbConnection.query(query, values);
            return this.mapToProject(result.rows[0]);
        } catch (error) {
            throw new Error(`Failed to create project: ${error.message}`);
        }
    }

    /**
     * Finds a Project entity by its unique identifier
     * @param id - The unique identifier of the Project
     * @returns Promise resolving to the found Project entity or null if not found
     */
    async findById(id: string): Promise<Project | null> {
        try {
            const query = `
                SELECT * FROM projects 
                WHERE id = $1 AND deleted_at IS NULL
            `;
            
            const result = await this.dbConnection.query(query, [id]);
            
            if (result.rows.length === 0) {
                return null;
            }

            return this.mapToProject(result.rows[0]);
        } catch (error) {
            throw new Error(`Failed to find project by id: ${error.message}`);
        }
    }

    /**
     * Updates an existing Project entity with partial data
     * @param id - The unique identifier of the Project to update
     * @param updates - Partial Project data containing only the properties to update
     * @returns Promise resolving to the updated Project entity
     */
    async update(id: string, updates: Partial<Project>): Promise<Project> {
        try {
            const updateData = updates as Record<string, unknown>;
            const setClauses: string[] = [];
            const values: unknown[] = [];
            let paramIndex = 1;

            // Build dynamic SET clause based on provided updates
            Object.entries(updateData).forEach(([key, value]) => {
                if (value !== undefined && key !== 'id') {
                    setClauses.push(`${this.toSnakeCase(key)} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });

            values.push(id);
            const query = `
                UPDATE projects 
                SET ${setClauses.join(', ')}, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $${paramIndex} AND deleted_at IS NULL 
                RETURNING *
            `;

            const result = await this.dbConnection.query(query, values);
            
            if (result.rows.length === 0) {
                throw new Error(`Project with id ${id} not found`);
            }

            return this.mapToProject(result.rows[0]);
        } catch (error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
    }

    /**
     * Soft deletes a Project entity by its unique identifier
     * @param id - The unique identifier of the Project to delete
     * @returns Promise resolving to true if deletion was successful, false otherwise
     */
    async delete(id: string): Promise<boolean> {
        try {
            const query = `
                UPDATE projects 
                SET deleted_at = CURRENT_TIMESTAMP 
                WHERE id = $1 AND deleted_at IS NULL
            `;
            
            const result = await this.dbConnection.query(query, [id]);
            return result.rowCount > 0;
        } catch (error) {
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    }

    /**
     * Retrieves a paginated list of Project entities
     * @param page - The page number to retrieve (1-based)
     * @param pageSize - The number of items per page
     * @returns Promise resolving to a paginated result containing the Project entities
     */
    async findAll(page: number, pageSize: number): Promise<PaginatedResult<Project>> {
        try {
            const offset = (page - 1) * pageSize;
            
            const countQuery = `
                SELECT COUNT(*) 
                FROM projects 
                WHERE deleted_at IS NULL
            `;
            
            const dataQuery = `
                SELECT * 
                FROM projects 
                WHERE deleted_at IS NULL 
                ORDER BY created_at DESC 
                LIMIT $1 OFFSET $2
            `;

            const [countResult, dataResult] = await Promise.all([
                this.dbConnection.query(countQuery),
                this.dbConnection.query(dataQuery, [pageSize, offset])
            ]);

            const total = parseInt(countResult.rows[0].count, 10);
            const projects = dataResult.rows.map(row => this.mapToProject(row));

            return {
                items: projects,
                total,
                page,
                pageSize
            };
        } catch (error) {
            throw new Error(`Failed to fetch projects: ${error.message}`);
        }
    }

    /**
     * Maps a database row to a Project entity
     * @param row - Database row containing project data
     * @returns Project entity
     * @private
     */
    private mapToProject(row: Record<string, unknown>): Project {
        return new Project(
            row.id as string,
            row.name as string,
            row.description as string,
            new Date(row.start_date as string),
            new Date(row.end_date as string),
            row.team_members as string[]
        );
    }

    /**
     * Converts a camelCase string to snake_case
     * @param str - String to convert
     * @returns Converted snake_case string
     * @private
     */
    private toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
}