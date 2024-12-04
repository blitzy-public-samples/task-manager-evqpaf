/**
 * Email configuration for the notification service
 * 
 * Requirement Addressed: Email Notification Configuration
 * Location: Technical Specification/System Design/Notification Service
 * Description: Implements email service configuration with SMTP settings and error handling
 * for reliable email notifications.
 * 
 * Human Tasks:
 * - Configure SMTP credentials in environment variables
 * - Set up email service provider account
 * - Configure SPF and DKIM records for the sending domain
 * - Set up email bounce handling and monitoring
 * - Configure email sending rate limits based on provider limits
 */

// nodemailer v6.9.3
import nodemailer from 'nodemailer';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { logger } from '../../shared/utils/logger';
import { handleError } from '../../shared/utils/error-handler';

/**
 * Email configuration object containing SMTP settings
 */
export const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
    }
};

/**
 * Creates and configures the nodemailer transporter instance
 */
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Sends an email using the configured SMTP settings
 * 
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param body - Email body content (HTML supported)
 * @returns Promise that resolves when email is sent successfully
 * @throws Error if email sending fails
 */
export const sendEmail = async (to: string, subject: string, body: string): Promise<void> => {
    try {
        // Validate email configuration
        if (!emailConfig.auth.user || !emailConfig.auth.pass) {
            throw new Error('Email configuration is incomplete. SMTP credentials are required.');
        }

        // Verify SMTP connection
        await transporter.verify();

        // Configure email options
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to,
            subject,
            html: body,
            headers: {
                'X-Application': 'Task Management System',
                'X-Service': 'Notification Service'
            }
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Log successful email sending
        logger.logInfo(`Email sent successfully to ${to}`);

    } catch (error) {
        // Log the error
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: `Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error
        });

        // Handle the error using the centralized error handler
        handleError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to send email notification',
            details: {
                recipient: to,
                error: error instanceof Error ? error.message : 'Unknown error',
                statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
            }
        }, {
            status: (code: number) => ({ json: (data: any) => {} })
        } as any);

        // Re-throw the error for the caller to handle
        throw error;
    }
};