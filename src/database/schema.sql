-- WebSec Auditor Database Schema
-- SQLite

-- ─── Scans ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
    id          TEXT PRIMARY KEY,
    target_url  TEXT NOT NULL,
    target_ip   TEXT,
    status      TEXT NOT NULL DEFAULT 'pending',  -- pending | running | completed | failed
    modules     TEXT NOT NULL DEFAULT '[]',       -- JSON array of enabled module names
    error       TEXT,                              -- Error message if failed
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

-- ─── Scan Results ───────────────────────────────
CREATE TABLE IF NOT EXISTS scan_results (
    id          TEXT PRIMARY KEY,
    scan_id     TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    module      TEXT NOT NULL,     -- profiler | vuln-scanner | exploit-sim | stress-tester
    data        TEXT NOT NULL,     -- Encrypted JSON payload
    severity    TEXT,              -- info | low | medium | high | critical
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_module ON scan_results(module);

-- ─── Audit Logs (Legal Compliance) ──────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp   TEXT NOT NULL DEFAULT (datetime('now')),
    target_url  TEXT,
    target_ip   TEXT,
    action      TEXT NOT NULL,     -- consent_given | scan_started | scan_completed | module_run | etc
    module      TEXT,
    details     TEXT,              -- Encrypted JSON with additional context
    user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ─── App Settings ───────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
