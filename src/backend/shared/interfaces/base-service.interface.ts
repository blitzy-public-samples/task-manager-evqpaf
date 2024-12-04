/**
 * @fileoverview Base service interface definition for standardized CRUD operations
 * 
 * Requirements Addressed:
 * - Standardized Service Interfaces (Technical Specification/System Architecture/Core Components)
 *   Ensures all services adhere to a common interface for consistency and maintainability.
 */

import { PaginatedResult } from '../interfaces/base-repository.interface';

/**
 * Base service interface that defines standard CRUD operations and common functionalities.
 * All concrete services should implement this interface to ensure consistency
 * across the application's business logic layer.
 * 
 * @typeParam T - The entity type that the service manages
 */
export interface BaseService<T> {
  /**
   * Creates a new entity
   * @param entity - The entity to create
   * @returns A promise that resolves to the created entity
   * @throws {ValidationError} If the entity data is invalid
   * @throws {DatabaseError} If there's an error during creation
   */
  create(entity: T): Promise<T>;

  /**
   * Retrieves an entity by its unique identifier
   * @param id - The unique identifier of the entity
   * @returns A promise that resolves to the found entity or null if not found
   * @throws {DatabaseError} If there's an error during retrieval
   */
  findById(id: string): Promise<T | null>;

  /**
   * Updates an existing entity with partial data
   * @param id - The unique identifier of the entity to update
   * @param updates - Partial entity containing only the properties to update
   * @returns A promise that resolves to the updated entity
   * @throws {NotFoundError} If the entity doesn't exist
   * @throws {ValidationError} If the update data is invalid
   * @throws {DatabaseError} If there's an error during update
   */
  update(id: string, updates: Partial<T>): Promise<T>;

  /**
   * Deletes an entity by its unique identifier
   * @param id - The unique identifier of the entity to delete
   * @returns A promise that resolves to true if deletion was successful, false otherwise
   * @throws {NotFoundError} If the entity doesn't exist
   * @throws {DatabaseError} If there's an error during deletion
   */
  delete(id: string): Promise<boolean>;

  /**
   * Retrieves a paginated list of entities
   * @param page - The page number to retrieve (1-based)
   * @param pageSize - The number of items per page
   * @returns A promise that resolves to a paginated result containing the entities
   * @throws {ValidationError} If pagination parameters are invalid
   * @throws {DatabaseError} If there's an error during retrieval
   */
  findAll(page: number, pageSize: number): Promise<PaginatedResult<T>>;
}