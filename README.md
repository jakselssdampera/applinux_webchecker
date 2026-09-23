# WebSec Auditor & Stress Tester

> All-in-one security auditing, vulnerability scanning, exploitation simulation, and stress testing platform for modern web applications.

---

## ⚠️ Legal Disclaimer

**This tool is designed for authorized security testing only.** You MUST have explicit written permission from the owner of any system you test. Unauthorized access to computer systems is illegal in most jurisdictions.

The developers assume no liability and are not responsible for any misuse or damage caused by this tool.

---

## Requirements

- Node.js 20+
- npm

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Generate random secrets (optional, fallbacks exist)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste output into .env as ENCRYPTION_KEY and COOKIE_SECRET

# 4. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Modules & Capabilities

| Module | Status | Features |
|---|---|---|
| **Technology Profiling** | ✅ Active | 30+ Tech signatures (Nginx, Apache, PHP, Laravel, React, WordPress), 12+ WAF detection, OS fingerprinting, security headers audit |
| **Vulnerability Scanner** | ✅ Active | Concurrent bounded crawler (4x concurrency), SQLi detection, Reflected XSS discovery, server misconfiguration detection |
| **Exploitation Simulator** | ✅ Active | Curated safe PoC payload library (SQLi, XSS, LFI, Command Injection, SSRF), automated non-destructive PoC verification, cURL reproduction generator |
| **Request Repeater Lab** | ✅ Active | Burp Suite-like interactive request mutator & repeater (`#repeater`), quick payload inserter, live status, latency & header inspector with SSRF protection |
| **Stress & Load Tester** | ✅ Active | High-throughput asynchronous HTTP flood engine (`undici`), configurable concurrency & duration, live RPS, latency breakdown & error distribution |
| **Executive Reporting** | ✅ Active | Print/PDF-ready HTML report generation (`GET /api/scan/:id/report`) with Executive Summary, Security Score & Grade (A-F), and Prioritized Remediation Roadmap |
| **Automated Test Suite** | ✅ Active | 17 Vitest unit tests covering crypto, SSRF validation, report generation, and payload integrity |

---

## Development & Testing Commands

```bash
# Typecheck
npm run typecheck

# Run test suite
npm test

# Build production bundle
npm run build

# Start production server
npm start
```

---

## License

MIT
