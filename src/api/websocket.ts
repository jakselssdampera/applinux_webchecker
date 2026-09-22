import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';
import { scanEngine, type ScanEvent } from '../core/engine.js';

/**
 * WebSocket handler for real-time scan progress updates.
 *
 * Clients connect to /ws and receive ScanEvent messages
 * as scans progress through modules.
 */
export async function websocketRoutes(fastify: FastifyInstance): Promise<void> {
  const clients = new Set<WebSocket>();

  // Broadcast scan events to all connected clients
  scanEngine.on('scan-event', (event: ScanEvent) => {
    const message = JSON.stringify(event);
    for (const client of clients) {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    }
  });

  fastify.get('/ws', { websocket: true }, (socket: WebSocket) => {
    clients.add(socket);

    // Send welcome message
    socket.send(
      JSON.stringify({
        type: 'connected',
        message: 'WebSocket connected. You will receive real-time scan updates.',
      })
    );

    socket.on('close', () => {
      clients.delete(socket);
    });

    socket.on('error', () => {
      clients.delete(socket);
    });
  });
}
