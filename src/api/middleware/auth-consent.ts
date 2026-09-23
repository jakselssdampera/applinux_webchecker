import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { auditLogger } from '../../core/audit-logger.js';

const CONSENT_COOKIE = 'websec_consent';

/**
 * Authorization Consent middleware.
 *
 * Per PRD Section 6 (Legal & Compliance):
 * - All scan-related API endpoints require user consent
 * - Consent is tracked via a signed cookie
 * - POST /api/consent — accept disclaimer
 * - All /api/scan* routes are blocked without consent
 */
async function authConsentPluginFn(fastify: FastifyInstance): Promise<void> {

  // ─── Consent endpoint ───────────────────────────
  fastify.post('/api/consent', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { accepted?: boolean } | undefined;

    if (!body?.accepted) {
      return reply.status(400).send({
        error: 'You must accept the authorization disclaimer',
        statusCode: 400,
      });
    }

    // Generate consent token (timestamp-based)
    const consentToken = `${Date.now()}-accepted`;

    // Set cookie (session-only — expires when browser closes)
    reply.setCookie(CONSENT_COOKIE, consentToken, {
      path: '/',
      httpOnly: true, // Secure against XSS
      sameSite: 'strict',
      signed: true,   // Cryptographically signed
    });

    // Audit log
    auditLogger.logConsent(request.headers['user-agent']);

    return reply.send({
      success: true,
      message: 'Authorization consent recorded',
    });
  });

  // ─── Check consent status ──────────────────────
  fastify.get('/api/consent/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const cookie = request.cookies[CONSENT_COOKIE];
    const unsigned = cookie ? request.unsignCookie(cookie) : null;
    return reply.send({
      consented: !!(unsigned && unsigned.valid && unsigned.value),
    });
  });

  // ─── Guard: block scan endpoints without consent ──
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Only guard scan-related routes
    const url = request.url;
    if (!url.startsWith('/api/scan')) return;

    const cookie = request.cookies[CONSENT_COOKIE];
    const unsigned = cookie ? request.unsignCookie(cookie) : null;
    if (!unsigned || !unsigned.valid || !unsigned.value) {
      return reply.status(403).send({
        error: 'Authorization Required',
        message: 'You must accept the authorization disclaimer before using scan features. You need legal authorization to test the target.',
        statusCode: 403,
      });
    }
  });
}

export const authConsentPlugin = fp(authConsentPluginFn);
