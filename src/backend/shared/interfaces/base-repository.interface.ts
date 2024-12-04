/**
 * @fileoverview Base repository interface definition for standardized CRUD operations
 * 
 * Requirements Addressed:
 * - Standardized Repository Interfaces (Technical Specification/System Architecture/Core Components)
 *   Ensures all repositories adhere to a common interface for consistency and maintainability.
 */

/**
 * Represents a paginated result set containing items of type T
 */
export type PaginatedResult<T> = {
  /** The list of items in the current page */
  items: T[];
  
  /** The total number of items across all pages */
  total: number;
  
  /** The current page number (1-based) */
  page: number;
  
  /** The maximum number of items per page */
  pageSize: number;
};

/**
 * Base repository interface that defines standard CRUD operations and common functionalities.
 * All concrete repositories should implement this interface to ensure consistency
 * across the application's data access layer.
 * 
 * @typeParam T - The entity type that the repository manages
 */
export interface BaseRepository<T> {
  /**
   * Creates a new entity in the repository
   * @param entity - The entity to create
   * @returns A promise that resolves to the created entity
   */
  create(entity: T): Promise<T>;

  /**
   * Retrieves an entity by its unique identifier
   * @param id - The unique identifier of the entity
   * @returns A promise that resolves to the found entity or null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Updates an existing entity with partial data
   * @param id - The unique identifier of the entity to update
   * @param updates - Partial entity containing only the properties to update
   * @returns A promise that resolves to the updated entity
   */
  update(id: string, updates: Partial<T>): Promise<T>;

  /**
   * Deletes an entity from the repository
   * @param id - The unique identifier of the entity to delete
   * @returns A promise that resolves to true if deletion was successful, false otherwise
   */
  delete(id: string): Promise<boolean>;

  /**
   * Retrieves a paginated list of entities
   * @param page - The page number to retrieve (1-based)
   * @param pageSize - The number of items per page
   * @returns A promise that resolves to a paginated result containing the entities
   */
  findAll(page: number, pageSize: number): Promise<PaginatedResult<T>>;
}