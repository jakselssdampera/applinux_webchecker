import { describe, it, expect, beforeAll } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { authConsentPlugin } from '../src/api/middleware/auth-consent.js';
import { config } from '../src/config.js';
import { initDatabase } from '../src/core/database.js';

describe('Auth Consent Middleware', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    await initDatabase();
    app = Fastify();
    await app.register(fastifyCookie, {
      secret: config.cookieSecret,
    });
    await app.register(authConsentPlugin);
    // Dummy scan route to test guard
    app.get('/api/scan/dummy', async () => ({ ok: true }));
    await app.ready();
  });

  it('should block /api/scan endpoint without consent cookie', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/scan/dummy',
    });
    expect(res.statusCode).toBe(403);
    const data = res.json();
    expect(data.error).toBe('Authorization Required');
  });

  it('should successfully submit consent and receive signed cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/consent',
      payload: { accepted: true },
    });

    expect(res.statusCode).toBe(200);
    const data = res.json();
    expect(data.success).toBe(true);

    // Check Set-Cookie header exists and is signed
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(String(setCookie)).toContain('websec_consent=');
    expect(String(setCookie)).toContain('HttpOnly');
  });

  it('should reject consent submission if accepted is false', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/consent',
      payload: { accepted: false },
    });

    expect(res.statusCode).toBe(400);
  });
});
