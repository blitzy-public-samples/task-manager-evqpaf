/**
 * @fileoverview WebSocket service for real-time notifications
 * 
 * Requirements Addressed:
 * - Real-Time Notifications (Technical Specification/System Design/Core Features and Functionalities/Collaboration)
 *   Implements WebSocket-based real-time notifications to enhance team collaboration and task tracking.
 * 
 * Human Tasks:
 * - Configure WebSocket server SSL/TLS in production
 * - Set up WebSocket load balancing if using multiple instances
 * - Configure WebSocket heartbeat intervals based on network conditions
 * - Set up WebSocket connection monitoring and metrics collection
 */

// ws v8.13.0
import WebSocket from 'ws';
import { logError, logInfo } from '../../shared/utils/logger';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { STATUS_CODES } from '../../shared/constants/status-codes';
import { redisClient } from '../config/redis.config';
import { Notification } from '../models/notification.model';

// Global WebSocket server instance
let webSocketServer: WebSocket.Server;

// Store connected clients with their IDs
const connectedClients: Map<string, WebSocket> = new Map();

/**
 * Initializes the WebSocket server and sets up event listeners
 * @param port - The port number to run the WebSocket server on
 */
export const initializeWebSocketServer = (port: number): void => {
  try {
    webSocketServer = new WebSocket.Server({
      port,
      perMessageDeflate: {
        zlibDeflateOptions: {
          level: 6 // Default compression level
        }
      },
      clientTracking: true,
      maxPayload: 1024 * 1024 // 1MB max message size
    });

    webSocketServer.on('connection', handleConnection);

    logInfo(`WebSocket server initialized and listening on port ${port}`);
  } catch (error) {
    logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to initialize WebSocket server',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
      }
    });
    throw error;
  }
};

/**
 * Handles new WebSocket connections
 * @param ws - WebSocket connection instance
 */
const handleConnection = (ws: WebSocket): void => {
  // Generate a unique client ID
  const clientId = generateClientId();
  connectedClients.set(clientId, ws);

  logInfo(`New WebSocket connection established. Client ID: ${clientId}`);

  // Set up event listeners for the connection
  ws.on('message', (data: WebSocket.Data) => handleMessage(ws, data));
  ws.on('close', () => handleClose(clientId));
  ws.on('error', (error: Error) => handleError(ws, error));

  // Send connection acknowledgment
  ws.send(JSON.stringify({
    type: 'connection_ack',
    clientId
  }));
};

/**
 * Handles incoming WebSocket messages
 * @param ws - WebSocket connection instance
 * @param data - Received message data
 */
const handleMessage = async (ws: WebSocket, data: WebSocket.Data): Promise<void> => {
  try {
    const message = JSON.parse(data.toString());
    
    // Validate notification if present
    if (message.notification) {
      const notification = new Notification(
        message.notification.id,
        message.notification.recipientId,
        message.notification.message,
        message.notification.status,
        new Date(message.notification.createdAt),
        new Date(message.notification.updatedAt)
      );

      const validationError = notification.validate();
      if (validationError) {
        ws.send(JSON.stringify({
          type: 'error',
          error: validationError
        }));
        return;
      }
    }

    // Cache message in Redis if needed
    if (message.persist) {
      await redisClient.set(
        `notification:${message.notification.id}`,
        JSON.stringify(message),
        'EX',
        86400 // 24 hours expiry
      );
    }

    // Process the message based on its type
    switch (message.type) {
      case 'broadcast':
        broadcastMessage(JSON.stringify(message.notification));
        break;
      case 'direct':
        sendDirectMessage(message.recipientId, JSON.stringify(message.notification));
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message type'
        }));
    }
  } catch (error) {
    logError({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Error processing WebSocket message',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
      }
    });
  }
};

/**
 * Broadcasts a message to all connected clients
 * @param message - Message to broadcast
 */
export const broadcastMessage = (message: string): void => {
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

/**
 * Sends a message to a specific client
 * @param recipientId - ID of the recipient client
 * @param message - Message to send
 */
const sendDirectMessage = (recipientId: string, message: string): void => {
  const client = connectedClients.get(recipientId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(message);
  }
};

/**
 * Handles WebSocket connection closure
 * @param clientId - ID of the client whose connection closed
 */
const handleClose = (clientId: string): void => {
  connectedClients.delete(clientId);
  logInfo(`WebSocket connection closed. Client ID: ${clientId}`);
};

/**
 * Handles WebSocket errors
 * @param ws - WebSocket connection instance
 * @param error - Error that occurred
 */
const handleError = (ws: WebSocket, error: Error): void => {
  logError({
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: 'WebSocket error occurred',
    details: {
      error: error.message,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR
    }
  });
  
  ws.send(JSON.stringify({
    type: 'error',
    error: 'Internal server error occurred'
  }));
};

/**
 * Generates a unique client ID
 * @returns Unique client ID string
 */
const generateClientId = (): string => {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};