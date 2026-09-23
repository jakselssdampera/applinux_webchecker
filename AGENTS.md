# Project Guidelines for AI Agents

This file outlines conventions, commands, and architectural patterns for AI coding agents working in this repository.

---

## 1. Project Overview

**WebSec Auditor & Stress Tester** is an all-in-one dynamic web application security scanning, exploitation simulation, and load resilience platform.

- **Backend**: Fastify 5 + TypeScript (ESM)
- **Database**: SQLite via `sql.js` (WASM, no native bindings) with debounced writes
- **HTTP Client**: `undici` for high-throughput network requests
- **Real-time**: `@fastify/websocket` with scan-id subscription filtering
- **Encryption**: AES-256-GCM with random per-operation salt and Scrypt key derivation
- **Frontend**: Vanilla JavaScript SPA (hash-based routing, no heavy build framework)
- **Testing**: `vitest`

---

## 2. Build and Test Commands

```powershell
# Run development server with live reload
npm run dev

# Run full TypeScript typecheck
npm run typecheck

# Run automated unit & integration test suite
npm test

# Build production bundle using esbuild
npm run build

# Start production server
npm start
```

---

## 3. Architecture & Conventions

### Directory Layout

```
src/
├── server.ts              # Fastify entry point, middleware & route registration
├── config.ts              # Environment settings (COOKIE_SECRET, ENCRYPTION_KEY)
├── core/                  # Core orchestration & utilities
│   ├── engine.ts          # ScanEngine event emitter orchestrating modules
│   ├── database.ts        # SQLite storage (scans, scan_results, audit_logs)
│   ├── http-client.ts     # Shared undici HTTP wrapper
│   ├── audit-logger.ts    # Compliance logging (file + database)
│   └── report-generator.ts# Executive HTML & print-to-PDF report generator
├── api/                   # REST API & WebSocket handlers
│   ├── routes/
│   │   ├── scan.routes.ts   # /api/scan, /api/scans, /api/stats, /api/scan/:id/report
│   │   ├── exploit.routes.ts# /api/exploit/payloads, /api/exploit/repeat
│   │   └── health.routes.ts # /api/health
│   ├── middleware/
│   │   ├── auth-consent.ts  # Signed cookie verification for testing consent
│   │   └── error-handler.ts # Fastify global error handler
│   └── websocket.ts       # Real-time progress updates with scan-id filtering
├── modules/               # Security & load testing engines
│   ├── profiler/          # WAF detection, technology signatures, headers
│   ├── vuln-scanner/      # Concurrent crawler, SQLi, XSS, misconfigurations
│   ├── exploit-sim/       # Safe PoC verification, payload generator & cURL builder
│   └── stress-tester/     # High-concurrency HTTP flooding engine
└── types/                 # Shared interfaces (IModule, etc.)
public/                    # Single-Page Application (HTML/CSS/JS)
test/                      # Vitest automated test suites
```

### Safety & Compliance Constraints

1. **SSRF Guardrail**: Any endpoint accepting a target URL must validate it through `validateTargetUrl()` in `src/utils/url-validator.ts` to block private/internal IP ranges (loopback, 10.x, 192.168.x, etc.).
2. **Safe Exploit Mode**: Automated exploit PoCs must be non-destructive (e.g. arithmetic comparisons, canary reflections, or safe time-delays) without dropping or modifying database records.
3. **Audit Trails**: All initiated scans must log to `auditLogger` for legal accountability.
4. **Git Versioning**: Always verify TypeScript (`npx tsc --noEmit`) and run tests (`npm test`) before committing and pushing to `origin/main`.
