/**
 * Integration tests for the notification service
 * 
 * Requirement Addressed: Notification Service Integration Testing
 * Location: Technical Specification/System Design/Testing Strategy
 * Description: Ensures the notification service integrates correctly with the email service,
 * WebSocket service, and database.
 * 
 * Human Tasks:
 * - Configure test environment variables for SMTP settings
 * - Set up test Redis instance for integration testing
 * - Configure test WebSocket server settings
 * - Ensure test database is properly seeded before running tests
 */

// jest v29.0.0
import { jest } from '@jest/globals';
// supertest v6.3.3
import supertest from 'supertest';

import { sendNotification } from '../../src/services/notification.service';
import { sendEmail } from '../../src/services/email.service';
import { broadcastMessage } from '../../src/services/websocket.service';
import { Notification } from '../../src/models/notification.model';
import { redisClient } from '../../src/config/redis.config';

// Mock dependencies
jest.mock('../../src/services/email.service');
jest.mock('../../src/services/websocket.service');
jest.mock('../../src/config/redis.config');

describe('Notification Service Integration Tests', () => {
    // Test data
    const mockNotificationData = {
        recipientId: 'user123',
        message: 'Test notification message'
    };

    // Setup before tests
    beforeAll(async () => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Initialize Redis client for testing
        await redisClient.connect();
    });

    // Cleanup after tests
    afterAll(async () => {
        // Disconnect Redis client
        await redisClient.disconnect();
        
        // Restore all mocks
        jest.restoreAllMocks();
    });

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('testNotificationServiceIntegration', () => {
        it('should successfully send notification through all channels', async () => {
            // Mock email service
            const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
            mockSendEmail.mockResolvedValueOnce();

            // Mock WebSocket service
            const mockBroadcastMessage = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
            mockBroadcastMessage.mockImplementationOnce(() => {});

            // Mock Redis client
            const mockRedisSet = jest.spyOn(redisClient, 'set');
            mockRedisSet.mockResolvedValueOnce('OK');

            // Execute notification sending
            await sendNotification(
                mockNotificationData.recipientId,
                mockNotificationData.message
            );

            // Verify email service was called correctly
            expect(mockSendEmail).toHaveBeenCalledTimes(1);
            expect(mockSendEmail).toHaveBeenCalledWith(
                mockNotificationData.recipientId,
                'New Notification',
                expect.stringContaining(mockNotificationData.message)
            );

            // Verify WebSocket broadcast was called correctly
            expect(mockBroadcastMessage).toHaveBeenCalledTimes(1);
            expect(mockBroadcastMessage).toHaveBeenCalledWith(
                expect.stringContaining(mockNotificationData.message)
            );

            // Verify notification data model validation
            const notification = new Notification(
                expect.any(String),
                mockNotificationData.recipientId,
                mockNotificationData.message,
                'unread',
                expect.any(Date),
                expect.any(Date)
            );
            const validationError = notification.validate();
            expect(validationError).toBeNull();
        });

        it('should handle email service failure gracefully', async () => {
            // Mock email service to fail
            const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
            mockSendEmail.mockRejectedValueOnce(new Error('Email service error'));

            // Mock WebSocket service
            const mockBroadcastMessage = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
            mockBroadcastMessage.mockImplementationOnce(() => {});

            // Expect the notification service to throw an error
            await expect(
                sendNotification(
                    mockNotificationData.recipientId,
                    mockNotificationData.message
                )
            ).rejects.toThrow('Email service error');

            // Verify WebSocket broadcast was not called due to email failure
            expect(mockBroadcastMessage).not.toHaveBeenCalled();
        });

        it('should handle WebSocket service failure gracefully', async () => {
            // Mock email service
            const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
            mockSendEmail.mockResolvedValueOnce();

            // Mock WebSocket service to fail
            const mockBroadcastMessage = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
            mockBroadcastMessage.mockImplementationOnce(() => {
                throw new Error('WebSocket service error');
            });

            // Expect the notification service to throw an error
            await expect(
                sendNotification(
                    mockNotificationData.recipientId,
                    mockNotificationData.message
                )
            ).rejects.toThrow('WebSocket service error');

            // Verify email was sent despite WebSocket failure
            expect(mockSendEmail).toHaveBeenCalledTimes(1);
        });

        it('should validate notification data before sending', async () => {
            // Test with invalid data
            const invalidData = {
                recipientId: '', // Empty recipient ID
                message: 'Test message'
            };

            // Expect validation error
            await expect(
                sendNotification(
                    invalidData.recipientId,
                    invalidData.message
                )
            ).rejects.toThrow('Invalid notification data');

            // Verify no services were called due to validation failure
            expect(sendEmail).not.toHaveBeenCalled();
            expect(broadcastMessage).not.toHaveBeenCalled();
        });

        it('should handle Redis caching correctly', async () => {
            // Mock Redis client
            const mockRedisSet = jest.spyOn(redisClient, 'set');
            mockRedisSet.mockResolvedValueOnce('OK');

            // Mock other services
            const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
            mockSendEmail.mockResolvedValueOnce();
            const mockBroadcastMessage = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
            mockBroadcastMessage.mockImplementationOnce(() => {});

            // Send notification
            await sendNotification(
                mockNotificationData.recipientId,
                mockNotificationData.message
            );

            // Verify Redis caching
            expect(mockRedisSet).toHaveBeenCalledWith(
                expect.stringContaining('notification:'),
                expect.any(String),
                'EX',
                expect.any(Number)
            );
        });
    });
});