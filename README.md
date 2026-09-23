# 🛡️ WebSec Auditor & Stress Tester

> All-in-one security auditing, vulnerability scanning, exploitation simulation, and load resilience platform for modern web applications.
>
> 📖 **[Baca Panduan Lengkap Penggunaan (Bahasa Indonesia)](file:///d:/Linux/App%20Linux/PANDUAN_PENGGUNAAN.md)**

---

## ⚠️ Legal & Ethical Disclaimer

**This tool is designed strictly for authorized security auditing, penetration testing, and educational purposes.** You **MUST** obtain explicit, documented permission from the owner of any website or IP before initiating scans, exploit simulations, or stress testing.

Unauthorized scanning or denial-of-service testing against unauthorized targets is illegal under computer misuse legislation worldwide. The authors assume no liability for misuse, downtime, or damages resulting from the use of this tool.

---

## 🚀 Key Features & Modules

| Module | Status | Highlights |
|---|---|---|
| **🔍 Tech Profiler** | ✅ Active | 30+ technology signatures (Nginx, Apache, PHP, Laravel, WordPress, React, Django), 12+ WAF detections (Cloudflare, AWS WAF, Akamai), OS banner analysis, security headers grade. |
| **🛡️ Vulnerability Scanner** | ✅ Active | Bounded concurrent crawler (4x concurrency), SQL Injection detection, Reflected XSS discovery, server misconfigurations (directory indexing, exposed `.env`, SSL/TLS weaknesses). |
| **⚡ Exploit Simulator** | ✅ Active | Curated library of 14 non-destructive PoC payloads, automated arithmetic & canary verification, reproduction cURL command generator with remediation roadmap. |
| **🧪 Request Repeater Lab** | ✅ Active | Burp Suite-inspired interactive request mutator (`#repeater`), quick payload insertion into URL/Body, live status, latency & headers inspection with SSRF guardrails. |
| **📊 Stress & Load Tester** | ✅ Active | Asynchronous HTTP flood engine built on `undici`, configurable Virtual Users (concurrency) & duration, real-time requests/second, latency breakdown, and error distribution. |
| **📄 Executive Reporting** | ✅ Active | Print/PDF-ready HTML report generation (`GET /api/scan/:id/report`) with Executive Summary, Security Score & Grade (A-F), and Prioritized Remediation Checklist. |
| **⚖️ Compliance & Security** | ✅ Active | Signed authorization consent cookies, AES-256-GCM encryption with per-operation random salt, SSRF loopback protections, and dual JSONL + SQLite audit logging. |

---

## 🏗️ Architecture

```
                    +--------------------------------+
                    |    Vanilla JS Dashboard SPA    |
                    | (Hash-based router / Glass UI) |
                    +---------------+----------------+
                                    |
                                    | REST / WebSocket
                                    v
                    +--------------------------------+
                    |       Fastify 5 Server         |
                    |  (Cookie Auth / Rate Limiting) |
                    +---------------+----------------+
                                    |
       +----------------------------+----------------------------+
       |                            |                            |
       v                            v                            v
+--------------+            +---------------+            +---------------+
|  ScanEngine  |            | Exploit Lab & |            | Report Engine |
| Orchestrator |            |   Repeater    |            |  (Print / PDF)|
+-------+------+            +-------+-------+            +---------------+
        |                           |
   +----+------------------+        | (SSRF Guardrail)
   |                       |        v
   v                       v  +-------------+
+-----------+        +-------------+  |   Target    |
| Profiler  |        | VulnScanner |  | Application |
|  Module   |        |  (Crawler)  |  +-------------+
+-----------+        +-------------+
   |                       |
   v                       v
+-----------+        +-------------+
|  Exploit  |        | StressTest  |
| Simulator |        |  (undici)   |
+-----------+        +-------------+
```

---

## 📋 Requirements

- **Runtime**: Node.js 20.x or higher
- **Package Manager**: npm 10.x or higher
- **Operating System**: Linux, macOS, or Windows

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/jakselssdampera/applinux_webchecker.git
cd applinux_webchecker

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.example .env

# 4. Generate random encryption key & cookie secret (optional, fallbacks exist)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste output into .env as ENCRYPTION_KEY and COOKIE_SECRET

# 5. Start development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔌 API Reference

### Scan Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scan` | Initiate a scan (`{ url: string, modules?: string[] }`) |
| `GET` | `/api/scan/:id` | Retrieve scan status, metadata, and decrypted findings |
| `GET` | `/api/scan/:id/report` | Render full executive HTML/PDF security audit report |
| `GET` | `/api/scans` | List scan history with pagination (`?limit=50&offset=0`) |
| `GET` | `/api/stats` | Dashboard statistics (Total, Completed, Running, Failed) |

### Exploitation & Repeater Lab

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/exploit/payloads` | Catalog of categorized safe proof-of-concept payloads |
| `POST` | `/api/exploit/repeat` | Manual request repeater (`{ url, method, headers, body }`) with SSRF protection |

### System & Realtime

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, uptime, and version info |
| `WS` | `/ws` | Real-time scan updates with `{ type: 'subscribe', scanId }` filtering |

---

## 🧪 Testing & Quality Assurance

The project includes an automated test suite powered by **Vitest**:

```powershell
# Run full unit & integration test suite
npm test

# Run strict TypeScript typecheck
npm run typecheck

# Build production bundle with esbuild
npm run build

# Start production server
npm start
```

### Test Coverage Highlights
- **Crypto Security**: AES-256-GCM encryption/decryption, per-operation random salt & IV uniqueness, tamper detection.
- **SSRF Guardrails**: Rejection of loopback (`127.0.0.1`, `::1`), private subnets (`10.x`, `192.168.x`, `172.16.x`), and non-HTTP protocols.
- **Reporting Engine**: Grade threshold calculations (A to F), HTML sanitization against XSS in target URLs.
- **Payload Integrity**: Validation of default safe flags and canary tokens across all 14 PoC payloads.

---

## 🔒 Security Architecture

1. **SSRF Guardrail (`src/utils/url-validator.ts`)**: Resolves hostnames via DNS and blocks requests targeting RFC 1918 private subnets, loopback, or cloud metadata endpoints.
2. **Safe Exploit Mode**: Automated vulnerability verification utilizes arithmetic comparisons (`1=1` vs `1=2`), benign time-delay checks, and console canary reflections without modifying database records.
3. **Encryption at Rest**: Stored scan findings are encrypted using AES-256-GCM with keys derived via Scrypt.
4. **Rate Limiting**: Enforced via `@fastify/rate-limit` (100 req/min default per client).
5. **Signed Consent Cookie**: Fastify cookie verification ensures the legal consent modal has been acknowledged before any scanning endpoint can be triggered.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
