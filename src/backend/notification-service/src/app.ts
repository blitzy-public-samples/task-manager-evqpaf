/**
 * Entry point for the Notification Service
 * 
 * Requirement Addressed: Notification Service Initialization
 * Location: Technical Specification/System Design/Core Components
 * Description: Sets up the notification service by initializing configurations, 
 * services, and the WebSocket server.
 * 
 * Human Tasks:
 * - Configure environment variables for service ports and settings
 * - Set up SSL/TLS certificates for production deployment
 * - Configure service monitoring and health checks
 * - Set up load balancer if deploying multiple instances
 * - Configure service discovery if using microservices architecture
 */

// express v4.18.2
import express from 'express';
// ws v8.13.0
import WebSocket from 'ws';

// Import configurations
import { emailConfig } from './config/email.config';
import { redisClient } from './config/redis.config';

// Import services and controllers
import { initializeWebSocketServer } from './services/websocket.service';
import { sendNotification } from './services/notification.service';
import { createNotification } from './controllers/notification.controller';

// Initialize Express application
const app = express();

/**
 * Initializes the Notification Service application
 */
const initializeApp = async (): Promise<void> => {
    try {
        // Configure Express middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Configure CORS
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
        });

        // Initialize WebSocket server
        const wsPort = parseInt(process.env.WEBSOCKET_PORT || '8080', 10);
        initializeWebSocketServer(wsPort);

        // Set up API routes
        app.post('/api/notifications', createNotification);

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    websocket: 'connected',
                    redis: redisClient.status === 'ready' ? 'connected' : 'disconnected',
                    email: emailConfig ? 'configured' : 'not_configured'
                }
            });
        });

        // Start the server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Notification Service listening on port ${port}`);
            console.log(`WebSocket Server running on port ${wsPort}`);
        });

    } catch (error) {
        console.error('Failed to initialize Notification Service:', error);
        process.exit(1);
    }
};

// Initialize the application
initializeApp();

// Export the Express app instance for testing and external use
export default app;