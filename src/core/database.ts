import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from '../config.js';

let db: SqlJsDatabase | null = null;
let dbPath: string = '';

/**
 * Initialize and return the SQLite database connection.
 * Uses sql.js (pure WASM SQLite — no native compilation needed).
 */
export async function initDatabase(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();

  dbPath = resolve(config.dbPath);
  mkdirSync(dirname(dbPath), { recursive: true });

  // Load existing database or create new
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Performance settings
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA synchronous = NORMAL');
  db.run('PRAGMA foreign_keys = ON');

  // Run schema
  const schemaPath = resolve(import.meta.dirname, '../database/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.run(schema);

  // Save to disk
  saveDatabase();

  return db;
}

/**
 * Get the database instance (must call initDatabase first).
 */
export function getDatabase(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

let saveTimeout: NodeJS.Timeout | null = null;

/**
 * Persist the in-memory database to disk with debounce.
 */
export function saveDatabase(): void {
  if (!db || !dbPath) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }, 1000);
}

/**
 * Close the database connection gracefully.
 */
export function closeDatabase(): void {
  if (db) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    // Synchronous save before close
    if (dbPath) {
      const data = db.export();
      const buffer = Buffer.from(data);
      writeFileSync(dbPath, buffer);
    }
    db.close();
    db = null;
  }
}

// ─── Query Helpers ──────────────────────────────

export interface ScanRow {
  id: string;
  target_url: string;
  target_ip: string | null;
  status: string;
  modules: string;
  error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ScanResultRow {
  id: string;
  scan_id: string;
  module: string;
  data: string;
  severity: string | null;
  created_at: string;
}

/** Helper: run a query that returns rows as objects */
function queryAll<T>(sql: string, params: unknown[] = []): T[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params as never[]);

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

/** Helper: run a query that returns one row */
function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  const rows = queryAll<T>(sql, params);
  return rows[0];
}

/** Helper: run a statement (INSERT/UPDATE/DELETE) */
function execute(sql: string, params: unknown[] = []): void {
  const database = getDatabase();
  database.run(sql, params as never[]);
  saveDatabase(); // Persist after write operations
}

export function insertScan(scan: {
  id: string;
  targetUrl: string;
  targetIp: string | null;
  modules: string[];
}): void {
  execute(
    `INSERT INTO scans (id, target_url, target_ip, status, modules)
     VALUES (?, ?, ?, 'pending', ?)`,
    [scan.id, scan.targetUrl, scan.targetIp, JSON.stringify(scan.modules)]
  );
}

export function updateScanStatus(
  scanId: string,
  status: string,
  error?: string
): void {
  const completedAt = status === 'completed' || status === 'failed'
    ? new Date().toISOString()
    : null;
  execute(
    `UPDATE scans SET status = ?, error = ?, updated_at = datetime('now'), completed_at = ?
     WHERE id = ?`,
    [status, error ?? null, completedAt, scanId]
  );
}

export function getScan(scanId: string): ScanRow | undefined {
  return queryOne<ScanRow>('SELECT * FROM scans WHERE id = ?', [scanId]);
}

export function listScans(limit = 50, offset = 0): ScanRow[] {
  return queryAll<ScanRow>(
    'SELECT * FROM scans ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
}

export function getDashboardStats() {
  const total = queryOne<{count: number}>('SELECT COUNT(*) as count FROM scans')?.count ?? 0;
  const completed = queryOne<{count: number}>("SELECT COUNT(*) as count FROM scans WHERE status = 'completed'")?.count ?? 0;
  const running = queryOne<{count: number}>("SELECT COUNT(*) as count FROM scans WHERE status = 'running'")?.count ?? 0;
  const failed = queryOne<{count: number}>("SELECT COUNT(*) as count FROM scans WHERE status = 'failed'")?.count ?? 0;
  return { total, completed, running, failed };
}

export function insertScanResult(result: {
  id: string;
  scanId: string;
  module: string;
  data: string;
  severity?: string;
}): void {
  execute(
    `INSERT INTO scan_results (id, scan_id, module, data, severity)
     VALUES (?, ?, ?, ?, ?)`,
    [result.id, result.scanId, result.module, result.data, result.severity ?? null]
  );
}

export function getScanResults(scanId: string): ScanResultRow[] {
  return queryAll<ScanResultRow>(
    'SELECT * FROM scan_results WHERE scan_id = ? ORDER BY created_at',
    [scanId]
  );
}
