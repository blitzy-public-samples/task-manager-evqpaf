/**
 * Email service implementation for sending notifications
 * 
 * Requirement Addressed: Email Notification Service
 * Location: Technical Specification/System Design/Notification Service
 * Description: Implements the email notification service to send emails reliably 
 * using SMTP settings and handle errors effectively.
 * 
 * Human Tasks:
 * - Configure SMTP server settings in environment variables
 * - Set up email service provider account and credentials
 * - Configure SPF and DKIM records for the sending domain
 * - Set up email bounce handling and monitoring
 * - Configure email sending rate limits based on provider limits
 */

// nodemailer v6.9.3
import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.config';
import { logger } from '../../shared/utils/logger';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { handleError } from '../../shared/utils/error-handler';

/**
 * Creates and configures the nodemailer transporter instance with SMTP settings
 */
const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
    pool: true, // Use pooled connections for better performance
    maxConnections: 5, // Maximum number of simultaneous connections
    maxMessages: 100, // Maximum number of messages per connection
    rateDelta: 1000, // How many messages to send in rateDelta time
    rateLimit: 5, // Maximum number of messages per rateDelta
    logger: true, // Enable built-in logger for debugging
});

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

        // Validate input parameters
        if (!to || !subject || !body) {
            throw new Error('Invalid email parameters. Recipient, subject, and body are required.');
        }

        // Verify SMTP connection before sending
        await transporter.verify();

        // Configure email options with headers and metadata
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to,
            subject,
            html: body,
            headers: {
                'X-Application': 'Task Management System',
                'X-Service': 'Notification Service',
                'X-Priority': 'Normal',
                'X-Mailer': 'Task Management Notification Service'
            },
            // Enable tracking features if supported by email provider
            trackingSettings: {
                openTracking: {
                    enable: true
                },
                clickTracking: {
                    enable: true
                }
            }
        };

        // Send email with retry logic
        let retries = 3;
        while (retries > 0) {
            try {
                await transporter.sendMail(mailOptions);
                break;
            } catch (sendError) {
                retries--;
                if (retries === 0) {
                    throw sendError;
                }
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
            }
        }

    } catch (error) {
        // Log the error with detailed context
        logger.logError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: `Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: {
                recipient: to,
                subject,
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                } : 'Unknown error',
                timestamp: new Date().toISOString()
            }
        });

        // Handle the error using the centralized error handler
        handleError({
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to send email notification',
            details: {
                recipient: to,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }, {
            status: (code: number) => ({ json: (data: any) => {} })
        } as any);

        // Re-throw the error for the caller to handle
        throw error;
    }
};