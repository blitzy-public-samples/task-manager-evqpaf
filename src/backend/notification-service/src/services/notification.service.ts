/**
 * @fileoverview Core notification service implementation
 * 
 * Requirement Addressed: Notification Service Implementation
 * Location: Technical Specification/System Design/Core Features and Functionalities/Collaboration
 * Description: Implements the notification service to send notifications via email and WebSocket 
 * for real-time updates.
 * 
 * Human Tasks:
 * - Configure email service provider settings in environment variables
 * - Set up WebSocket server SSL/TLS in production
 * - Configure notification rate limiting based on service provider limits
 * - Set up monitoring for notification delivery success rates
 */

import { Notification } from '../models/notification.model';
import { sendEmail } from './email.service';
import { initializeWebSocketServer, broadcastMessage } from './websocket.service';
import { logger } from '../../../shared/utils/logger';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { handleError } from '../../../shared/utils/error-handler';

// Initialize WebSocket server on port 8080 or from environment variable
initializeWebSocketServer(parseInt(process.env.WEBSOCKET_PORT || '8080', 10));

/**
 * Sends a notification to a user via email and WebSocket
 * 
 * @param recipientId - ID of the recipient user
 * @param message - Content of the notification message
 * @returns Promise that resolves when the notification is successfully sent
 * @throws Error if notification sending fails
 */
export const sendNotification = async (recipientId: string, message: string): Promise<void> => {
    try {
        // Create and validate notification instance
        const notification = new Notification(
            `notif_${Date.now()}`, // Generate unique notification ID
            recipientId,
            message,
            'unread', // Initial status
            new Date(), // Created timestamp
            new Date()  // Updated timestamp
        );

        // Validate notification data
        const validationError = notification.validate();
        if (validationError) {
            logger.logError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'Notification validation failed',
                details: validationError
            });
            throw new Error('Invalid notification data');
        }

        // Send email notification
        await sendEmail(
            recipientId, // Using recipientId as email for demonstration
            'New Notification',
            `<div>
                <h2>New Notification</h2>
                <p>${message}</p>
                <hr>
                <small>Sent at: ${notification.createdAt.toISOString()}</small>
            </div>`
        );

        // Broadcast real-time notification via WebSocket
        broadcastMessage(JSON.stringify({
            type: 'notification',
            data: {
                id: notification.id,
                recipientId: notification.recipientId,
                message: notification.message,
                status: notification.status,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt
            }
        }));

        // Log successful notification delivery
        logger.logInfo(`Notification sent successfully to recipient ${recipientId}`);

    } catch (error) {
        // Log the error with detailed context
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to send notification',
            details: {
                recipientId,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            }
        });

        // Handle the error using the centralized error handler
        handleError(error instanceof Error ? error : new Error('Failed to send notification'), {
            status: () => ({ json: () => {} })
        } as any);

        // Re-throw the error for the caller to handle
        throw error;
    }
};