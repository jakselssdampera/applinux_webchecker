# WebSec Auditor & Stress Tester

> All-in-one security auditing and stress testing tool for websites.

## ⚠️ Legal Disclaimer

**This tool is designed for authorized security testing only.** You MUST have explicit written permission from the owner of any system you test. Unauthorized access to computer systems is illegal in most jurisdictions.

The developers assume no liability and are not responsible for any misuse or damage caused by this tool.

## Requirements

- Node.js 20+
- npm

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste the output into .env as ENCRYPTION_KEY

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| Technology Profiling | ✅ Active | Detect web server, framework, CMS, WAF |
| Vulnerability Scanner | 🚧 Planned | OWASP Top 10 scanning |
| Exploit Simulator | 🚧 Planned | PoC validation & request interceptor |
| Stress Tester | 🚧 Planned | HTTP flood & Slowloris simulation |

## Project Structure

```
src/
├── server.ts          # Fastify entry point
├── config.ts          # Environment configuration
├── core/              # Core engine (scanner, DB, logger)
├── modules/           # Feature modules (profiler, vuln, etc.)
├── api/               # REST routes & WebSocket
├── database/          # Schema & migrations
└── utils/             # Shared utilities

public/                # Frontend dashboard (HTML/CSS/JS)
```

## License

MIT
