/**
 * @fileoverview Project interface definition for the application
 * 
 * Requirements Addressed:
 * - Project Organization (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 *   Implements data structure for project creation, categorization, team assignment, and progress tracking
 */

/**
 * Interface representing a project entity in the application.
 * Defines the core structure for project data management and organization.
 * 
 * @interface ProjectInterface
 * @property {string} id - Unique identifier for the project
 * @property {string} name - Name/title of the project
 * @property {string} description - Detailed description of the project
 * @property {Date} startDate - Project start date
 * @property {Date} endDate - Project end date/deadline
 * @property {string[]} teamMembers - Array of team member IDs assigned to the project
 * @property {string} status - Current status of the project
 */
export interface ProjectInterface {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    teamMembers: string[];
    status: string;
}