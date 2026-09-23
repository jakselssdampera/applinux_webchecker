/**
 * WebSec Auditor SQLite Schema Definition
 * Kept in TypeScript so it is bundled directly by esbuild without filesystem path fragility.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS scans (
    id          TEXT PRIMARY KEY,
    target_url  TEXT NOT NULL,
    target_ip   TEXT,
    status      TEXT NOT NULL DEFAULT 'pending',
    modules     TEXT NOT NULL DEFAULT '[]',
    error       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS scan_results (
    id          TEXT PRIMARY KEY,
    scan_id     TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    module      TEXT NOT NULL,
    data        TEXT NOT NULL,
    severity    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_module ON scan_results(module);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp   TEXT NOT NULL DEFAULT (datetime('now')),
    target_url  TEXT,
    target_ip   TEXT,
    action      TEXT NOT NULL,
    module      TEXT,
    details     TEXT,
    user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

CREATE TABLE IF NOT EXISTS app_settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
