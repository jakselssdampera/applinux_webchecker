import type { FastifyInstance } from 'fastify';
import { APP_NAME, APP_VERSION } from '../../utils/constants.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/health', async () => {
    return {
      status: 'ok',
      app: APP_NAME,
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  });
}
