import { mkdirSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from '../config.js';
import { getDatabase } from './database.js';

export interface AuditLogEntry {
  targetUrl?: string;
  targetIp?: string;
  action: string;
  module?: string;
  details?: Record<string, unknown>;
  userAgent?: string;
}

/**
 * Audit Logger — records all scanning activity for legal compliance.
 * Writes to both SQLite and rotating file logs.
 */
export class AuditLogger {
  private logDir: string;

  constructor() {
    this.logDir = resolve(config.auditLogDir);
    mkdirSync(this.logDir, { recursive: true });
  }

  /**
   * Log an audit entry to both database and file.
   */
  log(entry: AuditLogEntry): void {
    // Write to SQLite
    try {
      const db = getDatabase();
      db.run(
        `INSERT INTO audit_logs (target_url, target_ip, action, module, details, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          entry.targetUrl ?? null,
          entry.targetIp ?? null,
          entry.action,
          entry.module ?? null,
          entry.details ? JSON.stringify(entry.details) : null,
          entry.userAgent ?? null
        ]
      );
    } catch (err) {
      console.error('[AuditLogger] Failed to write to database:', err);
    }

    // Write to file log
    try {
      const logLine = JSON.stringify({
        timestamp: new Date().toISOString(),
        ...entry,
      });
      const fileName = `audit-${this.getDateString()}.jsonl`;
      const filePath = resolve(this.logDir, fileName);
      appendFileSync(filePath, logLine + '\n', 'utf-8');
    } catch (err) {
      console.error('[AuditLogger] Failed to write to file:', err);
    }
  }

  /**
   * Log a consent event.
   */
  logConsent(userAgent?: string): void {
    this.log({
      action: 'consent_given',
      details: { message: 'User accepted authorization disclaimer' },
      userAgent,
    });
  }

  /**
   * Log a scan start event.
   */
  logScanStart(scanId: string, targetUrl: string, targetIp: string | null, modules: string[]): void {
    this.log({
      targetUrl,
      targetIp: targetIp ?? undefined,
      action: 'scan_started',
      details: { scanId, modules },
    });
  }

  /**
   * Log a scan completion event.
   */
  logScanComplete(scanId: string, targetUrl: string, status: string): void {
    this.log({
      targetUrl,
      action: 'scan_completed',
      details: { scanId, status },
    });
  }

  private getDateString(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }
}

// Singleton
export const auditLogger = new AuditLogger();
