/**
 * @fileoverview Integration tests for authentication middleware and services
 * 
 * Requirement Addressed: Authentication Integration Testing
 * Location: Technical Specification/System Design/Testing Requirements
 * Description: Validates the integration of authentication middleware and services with API routes.
 * 
 * Human Tasks:
 * - Configure test environment variables for JWT secret and token expiration
 * - Set up test database with sample user data if required
 * - Review and update test coverage requirements
 * - Configure CI/CD pipeline for running integration tests
 */

// supertest v6.3.3
import request from 'supertest';
// jsonwebtoken v9.0.0
import jwt from 'jsonwebtoken';

// Internal imports
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { configureRoutes } from '../config/routes.config';
import initializeApp from '../app';
import errorMiddleware from '../middleware/error.middleware';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { STATUS_CODES } from '../../../shared/constants/status-codes';

describe('Authentication Integration Tests', () => {
    let app: any;
    let authService: AuthService;
    const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';

    beforeAll(() => {
        // Initialize the application
        app = initializeApp();
        authService = new AuthService();

        // Configure test route protected by auth middleware
        app.get('/test-protected', 
            authMiddleware(),
            (req: any, res: any) => res.status(200).json({ message: 'Success' })
        );

        // Configure test route with role-based access
        app.get('/test-admin',
            authMiddleware(['admin']),
            (req: any, res: any) => res.status(200).json({ message: 'Admin access granted' })
        );

        // Apply error middleware
        app.use(errorMiddleware);
    });

    describe('testAuthenticationMiddleware', () => {
        const validToken = jwt.sign(
            { userId: '123', email: 'test@example.com', role: 'user' },
            jwtSecret,
            { expiresIn: '1h' }
        );

        it('should allow access with valid token', async () => {
            const response = await request(app)
                .get('/test-protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(STATUS_CODES.OK);
            expect(response.body.message).toBe('Success');
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/test-protected');

            expect(response.status).toBe(STATUS_CODES.UNAUTHORIZED);
            expect(response.body.error.code).toBe(ERROR_CODES.AUTHENTICATION_FAILED);
        });

        it('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/test-protected')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(STATUS_CODES.UNAUTHORIZED);
            expect(response.body.error.code).toBe(ERROR_CODES.AUTHENTICATION_FAILED);
        });

        it('should reject request with expired token', async () => {
            const expiredToken = jwt.sign(
                { userId: '123', email: 'test@example.com', role: 'user' },
                jwtSecret,
                { expiresIn: '0s' }
            );

            const response = await request(app)
                .get('/test-protected')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(response.status).toBe(STATUS_CODES.UNAUTHORIZED);
            expect(response.body.error.code).toBe(ERROR_CODES.AUTHENTICATION_FAILED);
        });
    });

    describe('testAuthServiceIntegration', () => {
        let adminToken: string;
        let userToken: string;

        beforeEach(() => {
            // Generate tokens for different roles
            adminToken = jwt.sign(
                { userId: 'admin123', email: 'admin@example.com', role: 'admin' },
                jwtSecret,
                { expiresIn: '1h' }
            );

            userToken = jwt.sign(
                { userId: 'user123', email: 'user@example.com', role: 'user' },
                jwtSecret,
                { expiresIn: '1h' }
            );
        });

        it('should validate token and extract user information', async () => {
            const response = await request(app)
                .get('/test-protected')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(STATUS_CODES.OK);
            expect(response.body.message).toBe('Success');
        });

        it('should allow admin access to admin-only routes', async () => {
            const response = await request(app)
                .get('/test-admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(STATUS_CODES.OK);
            expect(response.body.message).toBe('Admin access granted');
        });

        it('should deny user access to admin-only routes', async () => {
            const response = await request(app)
                .get('/test-admin')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(STATUS_CODES.FORBIDDEN);
            expect(response.body.error.code).toBe(ERROR_CODES.AUTHORIZATION_FAILED);
        });

        it('should handle malformed tokens correctly', async () => {
            const malformedToken = adminToken.substring(10); // Remove part of the token

            const response = await request(app)
                .get('/test-protected')
                .set('Authorization', `Bearer ${malformedToken}`);

            expect(response.status).toBe(STATUS_CODES.UNAUTHORIZED);
            expect(response.body.error.code).toBe(ERROR_CODES.AUTHENTICATION_FAILED);
        });

        it('should validate token format in authorization header', async () => {
            const response = await request(app)
                .get('/test-protected')
                .set('Authorization', userToken); // Missing 'Bearer ' prefix

            expect(response.status).toBe(STATUS_CODES.UNAUTHORIZED);
            expect(response.body.error.code).toBe(ERROR_CODES.AUTHENTICATION_FAILED);
        });
    });
});