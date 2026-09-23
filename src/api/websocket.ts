import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';
import { scanEngine, type ScanEvent } from '../core/engine.js';

interface ClientState {
  subscribedScanId?: string;
}

/**
 * WebSocket handler for real-time scan progress updates.
 *
 * Clients connect to /ws and receive ScanEvent messages.
 * Supports subscription filtering:
 *   { "type": "subscribe", "scanId": "xyz" }
 *   { "type": "unsubscribe" }
 */
export async function websocketRoutes(fastify: FastifyInstance): Promise<void> {
  const clients = new Map<WebSocket, ClientState>();

  // Broadcast scan events to interested clients
  scanEngine.on('scan-event', (event: ScanEvent) => {
    const message = JSON.stringify(event);
    for (const [socket, state] of clients.entries()) {
      if (socket.readyState === 1) { // OPEN
        // Send if client has no specific subscription (global) or matches scanId
        if (!state.subscribedScanId || state.subscribedScanId === event.scanId) {
          socket.send(message);
        }
      }
    }
  });

  fastify.get('/ws', { websocket: true }, (socket: WebSocket) => {
    clients.set(socket, {});

    // Send welcome message
    socket.send(
      JSON.stringify({
        type: 'connected',
        message: 'WebSocket connected. You will receive real-time scan updates.',
      })
    );

    socket.on('message', (rawData: Buffer | string) => {
      try {
        const msg = JSON.parse(rawData.toString());
        if (msg.type === 'subscribe' && typeof msg.scanId === 'string') {
          clients.set(socket, { subscribedScanId: msg.scanId });
          socket.send(
            JSON.stringify({
              type: 'subscribed',
              scanId: msg.scanId,
              message: `Subscribed to scan ${msg.scanId}`,
            })
          );
        } else if (msg.type === 'unsubscribe') {
          clients.set(socket, {});
          socket.send(
            JSON.stringify({
              type: 'unsubscribed',
              message: 'Subscribed to global events',
            })
          );
        }
      } catch {
        // Ignore malformed messages
      }
    });

    socket.on('close', () => {
      clients.delete(socket);
    });

    socket.on('error', () => {
      clients.delete(socket);
    });
  });
}
