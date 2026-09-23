import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import { resolve } from 'node:path';

import { config } from './config.js';
import { initDatabase, closeDatabase } from './core/database.js';
import { errorHandlerPlugin } from './api/middleware/error-handler.js';
import { authConsentPlugin } from './api/middleware/auth-consent.js';
import { healthRoutes } from './api/routes/health.routes.js';
import { scanRoutes } from './api/routes/scan.routes.js';
import { exploitRoutes } from './api/routes/exploit.routes.js';
import { websocketRoutes } from './api/websocket.js';
import { APP_NAME, APP_VERSION } from './utils/constants.js';

async function main(): Promise<void> {
  const fastify = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  // ─── Initialize Database ────────────────────────
  await initDatabase();
  fastify.log.info('Database initialized');

  // ─── Register Plugins ──────────────────────────
  const cookieSecret = config.cookieSecret && config.cookieSecret.length >= 16
    ? config.cookieSecret
    : 'websec-auditor-secure-fallback-cookie-secret-32b';

  await fastify.register(fastifyCookie, {
    secret: cookieSecret, // for signed cookies
  });

  await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  await fastify.register(fastifyWebsocket);

  await fastify.register(fastifyStatic, {
    root: resolve(import.meta.dirname, '../public'),
    prefix: '/',
  });

  // ─── Register Middleware ───────────────────────
  await fastify.register(errorHandlerPlugin);
  await fastify.register(authConsentPlugin);

  // ─── Register Routes ──────────────────────────
  await fastify.register(healthRoutes);
  await fastify.register(scanRoutes);
  await fastify.register(exploitRoutes);
  await fastify.register(websocketRoutes);

  // ─── Graceful Shutdown ─────────────────────────
  const shutdown = async (signal: string) => {
    fastify.log.info(`${signal} received. Shutting down...`);
    await fastify.close();
    closeDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // ─── Start Server ─────────────────────────────
  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║    ${APP_NAME} v${APP_VERSION}              ║
║                                              ║
║    → http://localhost:${config.port}                ║
║                                              ║
║    ⚠  Use responsibly & with authorization   ║
║                                              ║
╚══════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
