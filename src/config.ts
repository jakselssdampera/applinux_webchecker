import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

// Load .env file if present
function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  host: process.env['HOST'] ?? '0.0.0.0',

  dbPath: process.env['DB_PATH'] ?? './data/websec.db',

  encryptionKey: process.env['ENCRYPTION_KEY'] ?? '',
  cookieSecret: process.env['COOKIE_SECRET'] ?? randomBytes(32).toString('hex'),

  logLevel: (process.env['LOG_LEVEL'] ?? 'info') as 'debug' | 'info' | 'warn' | 'error',
  auditLogDir: process.env['AUDIT_LOG_DIR'] ?? './data/audit-logs',
} as const;

export type AppConfig = typeof config;
