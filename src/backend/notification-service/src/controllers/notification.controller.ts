/**
 * @fileoverview Notification controller implementation for handling notification-related API endpoints
 * 
 * Requirement Addressed: Notification API Endpoints
 * Location: Technical Specification/System Design/API Design/API Architecture
 * Description: Implements API endpoints for creating, retrieving, and managing notifications.
 * 
 * Human Tasks:
 * - Configure rate limiting for notification endpoints
 * - Set up monitoring for API endpoint performance
 * - Configure API authentication and authorization
 * - Set up API documentation generation
 */

import { Request, Response } from 'express'; // express v4.18.2
import { sendNotification } from '../services/notification.service';
import { Notification } from '../models/notification.model';
import { handleError } from '../../shared/utils/error-handler';
import { formatSuccessResponse } from '../../shared/utils/response-formatter';
import { STATUS_CODES } from '../../shared/constants/status-codes';

/**
 * Creates a new notification and sends it to the recipient
 * 
 * @param req - Express request object containing notification data
 * @param res - Express response object for sending the API response
 */
export const createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { recipientId, message } = req.body;

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
            handleError(validationError, res);
            return;
        }

        // Send notification using the notification service
        await sendNotification(recipientId, message);

        // Send success response
        res.status(STATUS_CODES.OK).json(
            formatSuccessResponse({
                message: 'Notification created and sent successfully',
                notification: {
                    id: notification.id,
                    recipientId: notification.recipientId,
                    message: notification.message,
                    status: notification.status,
                    createdAt: notification.createdAt,
                    updatedAt: notification.updatedAt
                }
            })
        );

    } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to create notification'), res);
    }
};

/**
 * Retrieves a list of notifications for a specific user
 * 
 * @param req - Express request object containing user ID
 * @param res - Express response object for sending the API response
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Validate user ID
        if (!userId) {
            handleError({
                code: 'VALIDATION_ERROR',
                message: 'User ID is required',
                details: {
                    statusCode: STATUS_CODES.BAD_REQUEST,
                    field: 'userId'
                }
            }, res);
            return;
        }

        // For demonstration, returning a mock response
        // In a real implementation, this would query the database
        const mockNotifications = [
            new Notification(
                `notif_${Date.now()}_1`,
                userId,
                'Test notification 1',
                'unread',
                new Date(Date.now() - 3600000), // 1 hour ago
                new Date(Date.now() - 3600000)
            ),
            new Notification(
                `notif_${Date.now()}_2`,
                userId,
                'Test notification 2',
                'read',
                new Date(Date.now() - 7200000), // 2 hours ago
                new Date(Date.now() - 7200000)
            )
        ];

        // Send success response with notifications
        res.status(STATUS_CODES.OK).json(
            formatSuccessResponse({
                userId,
                notifications: mockNotifications.map(notification => ({
                    id: notification.id,
                    recipientId: notification.recipientId,
                    message: notification.message,
                    status: notification.status,
                    createdAt: notification.createdAt,
                    updatedAt: notification.updatedAt
                }))
            })
        );

    } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to retrieve notifications'), res);
    }
};