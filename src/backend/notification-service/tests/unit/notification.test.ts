// jest v29.0.0
import { sendNotification } from '../../src/services/notification.service';
import { sendEmail } from '../../src/services/email.service';
import { broadcastMessage } from '../../src/services/websocket.service';
import { Notification } from '../../src/models/notification.model';
import { ERROR_CODES } from '../../../shared/constants/error-codes';

// Mock dependencies
jest.mock('../../src/services/email.service');
jest.mock('../../src/services/websocket.service');

describe('Notification Service Tests', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendNotification', () => {
        it('should successfully send notification via email and WebSocket', async () => {
            // Arrange
            const recipientId = 'user123';
            const message = 'Test notification message';
            const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
            const mockBroadcastMessage = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;

            // Act
            await sendNotification(recipientId, message);

            // Assert
            // Verify email was sent
            expect(mockSendEmail).toHaveBeenCalledTimes(1);
            expect(mockSendEmail).toHaveBeenCalledWith(
                recipientId,
                'New Notification',
                expect.stringContaining(message)
            );

            // Verify WebSocket broadcast was made
            expect(mockBroadcastMessage).toHaveBeenCalledTimes(1);
            expect(mockBroadcastMessage).toHaveBeenCalledWith(
                expect.stringContaining(message)
            );
        });

        it('should throw error when email service fails', async () => {
            // Arrange
            const recipientId = 'user123';
            const message = 'Test notification message';
            const mockError = new Error('Email service error');
            const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
            mockSendEmail.mockRejectedValueOnce(mockError);

            // Act & Assert
            await expect(sendNotification(recipientId, message))
                .rejects
                .toThrow(mockError);
            expect(mockSendEmail).toHaveBeenCalledTimes(1);
            expect(broadcastMessage).not.toHaveBeenCalled();
        });

        it('should throw error when WebSocket service fails', async () => {
            // Arrange
            const recipientId = 'user123';
            const message = 'Test notification message';
            const mockError = new Error('WebSocket service error');
            const mockBroadcastMessage = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
            mockBroadcastMessage.mockImplementationOnce(() => {
                throw mockError;
            });

            // Act & Assert
            await expect(sendNotification(recipientId, message))
                .rejects
                .toThrow(mockError);
            expect(sendEmail).toHaveBeenCalledTimes(1);
            expect(mockBroadcastMessage).toHaveBeenCalledTimes(1);
        });
    });

    describe('Notification Model Validation', () => {
        it('should validate a valid notification object', () => {
            // Arrange
            const notification = new Notification(
                'notif_123',
                'user123',
                'Test message',
                'unread',
                new Date(),
                new Date()
            );

            // Act
            const validationError = notification.validate();

            // Assert
            expect(validationError).toBeNull();
        });

        it('should return error for missing required fields', () => {
            // Arrange
            const notification = new Notification(
                '', // Invalid empty ID
                'user123',
                'Test message',
                'unread',
                new Date(),
                new Date()
            );

            // Act
            const validationError = notification.validate();

            // Assert
            expect(validationError).not.toBeNull();
            expect(validationError?.code).toBe(ERROR_CODES.VALIDATION_ERROR);
            expect(validationError?.details.fields.id).toBe('Required');
        });

        it('should return error for invalid status', () => {
            // Arrange
            const notification = new Notification(
                'notif_123',
                'user123',
                'Test message',
                'invalid_status', // Invalid status
                new Date(),
                new Date()
            );

            // Act
            const validationError = notification.validate();

            // Assert
            expect(validationError).not.toBeNull();
            expect(validationError?.code).toBe(ERROR_CODES.VALIDATION_ERROR);
            expect(validationError?.message).toContain('Invalid status');
        });

        it('should return error for message exceeding maximum length', () => {
            // Arrange
            const longMessage = 'a'.repeat(1001); // Exceeds 1000 character limit
            const notification = new Notification(
                'notif_123',
                'user123',
                longMessage,
                'unread',
                new Date(),
                new Date()
            );

            // Act
            const validationError = notification.validate();

            // Assert
            expect(validationError).not.toBeNull();
            expect(validationError?.code).toBe(ERROR_CODES.VALIDATION_ERROR);
            expect(validationError?.message).toContain('Message length');
            expect(validationError?.details.field).toBe('message');
        });

        it('should return error for invalid timestamp format', () => {
            // Arrange
            const notification = new Notification(
                'notif_123',
                'user123',
                'Test message',
                'unread',
                'invalid_date' as any, // Invalid date format
                new Date()
            );

            // Act
            const validationError = notification.validate();

            // Assert
            expect(validationError).not.toBeNull();
            expect(validationError?.code).toBe(ERROR_CODES.VALIDATION_ERROR);
            expect(validationError?.details.fields.createdAt).toBe('Invalid date format');
        });
    });
});