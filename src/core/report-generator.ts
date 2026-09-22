import { APP_NAME, APP_VERSION } from '../utils/constants.js';

interface ScanReportData {
  id: string;
  targetUrl: string;
  targetIp: string | null;
  status: string;
  modules: string[];
  createdAt: string;
  completedAt: string | null;
  results: Array<{
    module: string;
    data: any;
  }>;
}

export function generateHtmlReport(scan: ScanReportData): string {
  // Extract module results
  let profilerData: any = null;
  let vulnData: any = null;
  let exploitData: any = null;
  let stressData: any = null;

  for (const r of scan.results) {
    if (r.module === 'profiler') profilerData = r.data;
    if (r.module === 'vuln-scanner') vulnData = r.data;
    if (r.module === 'exploit-sim') exploitData = r.data;
    if (r.module === 'stress-tester') stressData = r.data;
  }

  // Calculate stats & risk score
  const vulns = vulnData?.vulnerabilities || [];
  const exploits = exploitData?.findings || [];

  const critCount = vulns.filter((v: any) => v.severity === 'critical').length +
    exploits.filter((e: any) => e.severity === 'critical').length;
  const highCount = vulns.filter((v: any) => v.severity === 'high').length +
    exploits.filter((e: any) => e.severity === 'high').length;
  const medCount = vulns.filter((v: any) => v.severity === 'medium').length +
    exploits.filter((e: any) => e.severity === 'medium').length;
  const lowCount = vulns.filter((v: any) => v.severity === 'low').length +
    exploits.filter((e: any) => e.severity === 'low').length;

  // Grade calculation
  let score = 100;
  score -= critCount * 30;
  score -= highCount * 15;
  score -= medCount * 8;
  score -= lowCount * 3;
  if (score < 0) score = 0;

  let grade = 'A';
  let gradeColor = '#10b981';
  if (score < 50) {
    grade = 'F';
    gradeColor = '#ef4444';
  } else if (score < 70) {
    grade = 'D';
    gradeColor = '#f97316';
  } else if (score < 85) {
    grade = 'C';
    gradeColor = '#eab308';
  } else if (score < 95) {
    grade = 'B';
    gradeColor = '#06b6d4';
  }

  const escape = (str: any) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Audit Report — ${escape(scan.targetUrl)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-heading: #f0f6fc;
      --text-muted: #8b949e;
      --cyan: #38bdf8;
      --emerald: #10b981;
      --rose: #ef4444;
      --amber: #f59e0b;
      --purple: #a855f7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container { max-width: 960px; margin: 0 auto; }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-critical { background: rgba(239, 68, 68, 0.2); color: var(--rose); border: 1px solid var(--rose); }
    .badge-high { background: rgba(249, 115, 22, 0.2); color: #f97316; border: 1px solid #f97316; }
    .badge-medium { background: rgba(245, 158, 11, 0.2); color: var(--amber); border: 1px solid var(--amber); }
    .badge-low { background: rgba(56, 189, 248, 0.2); color: var(--cyan); border: 1px solid var(--cyan); }
    .badge-info { background: rgba(139, 148, 158, 0.2); color: var(--text-muted); border: 1px solid var(--border); }
    
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .score-banner {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 1.5rem;
      align-items: center;
      background: linear-gradient(135deg, rgba(22, 27, 34, 0.9), rgba(13, 17, 23, 0.9));
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .grade-circle {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 4px solid ${gradeColor};
      color: ${gradeColor};
      margin: 0 auto;
    }
    .grade-letter { font-size: 3rem; font-weight: 800; line-height: 1; }
    .grade-score { font-size: 0.8rem; color: var(--text-muted); }
    
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .meta-item {
      background: rgba(255,255,255,0.02);
      padding: 0.75rem;
      border-radius: 6px;
      border-left: 3px solid var(--cyan);
    }
    .meta-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
    .meta-value { font-size: 1.1rem; font-weight: 600; color: var(--text-heading); }

    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
    th { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
    pre, code { font-family: "JetBrains Mono", Consolas, monospace; font-size: 0.85rem; }
    pre {
      background: #090d13;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      overflow-x: auto;
      border: 1px solid var(--border);
      margin: 0.5rem 0;
    }
    .print-btn {
      background: var(--cyan);
      color: #0f172a;
      border: none;
      padding: 0.6rem 1.2rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .print-btn:hover { opacity: 0.9; }

    @media print {
      body { background: #fff !important; color: #111 !important; padding: 0 !important; }
      .card, .score-banner { background: #fff !important; border: 1px solid #ccc !important; box-shadow: none !important; }
      .text-heading, h1, h2, h3, h4 { color: #000 !important; }
      .header-bar button { display: none !important; }
      pre { background: #f5f5f5 !important; color: #000 !important; border: 1px solid #ddd !important; }
      .grade-circle { border-color: #333 !important; color: #333 !important; }
      .meta-item { border-left-color: #666 !important; background: #fafafa !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div>
        <h1 style="color:var(--text-heading);font-size:1.5rem;display:flex;align-items:center;gap:0.5rem;">
          🛡️ ${APP_NAME} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:normal;">v${APP_VERSION}</span>
        </h1>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.25rem;">
          Target: <strong style="color:var(--cyan);">${escape(scan.targetUrl)}</strong> | Date: ${new Date(scan.createdAt).toLocaleString()}
        </p>
      </div>
      <div>
        <button class="print-btn" onclick="window.print()">
          🖨️ Print / Save PDF
        </button>
      </div>
    </div>

    <!-- Executive Summary & Score -->
    <div class="score-banner">
      <div class="grade-circle">
        <span class="grade-letter">${grade}</span>
        <span class="grade-score">${score}/100</span>
      </div>
      <div>
        <h2 style="color:var(--text-heading);margin-bottom:0.5rem;">Executive Security Assessment</h2>
        <p style="color:var(--text-muted);font-size:0.9rem;">
          Audit completed with status <strong style="color:var(--emerald);text-transform:uppercase;">${scan.status}</strong> across 
          <strong>${scan.modules.length} modules</strong>. Target server hosted at <code>${escape(scan.targetIp || 'Dynamic / Protected')}</code>.
        </p>
        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Critical / High</div>
            <div class="meta-value" style="color:${critCount + highCount > 0 ? 'var(--rose)' : 'var(--emerald)'};">
              ${critCount + highCount}
            </div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Total Vulnerabilities</div>
            <div class="meta-value">${vulns.length}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Verified PoCs</div>
            <div class="meta-value" style="color:var(--purple);">${exploits.length}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Stress Capacity</div>
            <div class="meta-value">${stressData ? stressData.requestsPerSecond + ' RPS' : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Technology Profiling -->
    ${profilerData ? `
    <div class="card">
      <h3 style="color:var(--text-heading);margin-bottom:1rem;">🔍 Technology Profile & Fingerprint</h3>
      <table>
        <tr>
          <th style="width:200px;">Web Server</th>
          <td><strong>${escape(profilerData.server?.server || 'Hidden / Generic')}</strong></td>
        </tr>
        <tr>
          <th>Detected Technologies</th>
          <td>
            ${(profilerData.technologies || []).length > 0
              ? profilerData.technologies.map((t: any) => `<span class="badge badge-info" style="margin:2px;">${escape(t.name)} (${t.category})</span>`).join(' ')
              : '<span style="color:var(--text-muted)">None directly identified</span>'}
          </td>
        </tr>
        <tr>
          <th>WAF Protection</th>
          <td>
            ${profilerData.waf?.detected
              ? `<span class="badge badge-critical" style="background:rgba(16,185,129,0.2);color:var(--emerald);border-color:var(--emerald);">DETECTED: ${escape(profilerData.waf.name)}</span>`
              : '<span class="badge badge-info">No WAF detected</span>'}
          </td>
        </tr>
        <tr>
          <th>Missing Security Headers</th>
          <td>
            ${(profilerData.headers?.missingSecurityHeaders || []).length > 0
              ? profilerData.headers.missingSecurityHeaders.map((h: string) => `<code style="color:var(--amber);margin-right:6px;">${escape(h)}</code>`).join(' ')
              : '<span style="color:var(--emerald)">All recommended headers present</span>'}
          </td>
        </tr>
      </table>
    </div>
    ` : ''}

    <!-- Exploitation Simulator Findings -->
    ${exploits.length > 0 ? `
    <div class="card" style="border-left: 4px solid var(--purple);">
      <h3 style="color:var(--text-heading);margin-bottom:1rem;">⚡ Exploitation Simulator — Validated Proof-of-Concepts</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">
        Automated non-destructive testing confirmed the following exploit vectors.
      </p>
      ${exploits.map((e: any) => `
        <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:6px;padding:1rem;margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <div>
              <span class="badge badge-${e.severity}">${e.severity}</span>
              <strong style="color:var(--text-heading);margin-left:0.5rem;">${escape(e.vulnType)}</strong>
            </div>
            <span class="badge badge-high" style="text-transform:uppercase;">${escape(e.verificationStatus)}</span>
          </div>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;">
            <strong>Parameter:</strong> <code>${escape(e.parameter || 'URL/Header')}</code> | 
            <strong>Evidence:</strong> ${escape(e.evidence)}
          </p>
          <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;margin-top:0.5rem;">Proof of Concept cURL:</div>
          <pre><code>${escape(e.curlCommand)}</code></pre>
          <div style="background:rgba(16,185,129,0.1);border-left:3px solid var(--emerald);padding:0.6rem;border-radius:4px;margin-top:0.5rem;font-size:0.85rem;">
            <strong>Remediation:</strong> ${escape(e.remediation)}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Vulnerabilities -->
    ${vulns.length > 0 ? `
    <div class="card">
      <h3 style="color:var(--text-heading);margin-bottom:1rem;">🛡️ Discovered Vulnerabilities</h3>
      <table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Vulnerability</th>
            <th>Endpoint</th>
            <th>Remediation</th>
          </tr>
        </thead>
        <tbody>
          ${vulns.map((v: any) => `
            <tr>
              <td><span class="badge badge-${v.severity}">${v.severity}</span></td>
              <td><strong>${escape(v.title)}</strong><br><small style="color:var(--text-muted)">${escape(v.description)}</small></td>
              <td><code style="color:var(--cyan);word-break:break-all;">${escape(v.url)}</code></td>
              <td style="font-size:0.85rem;">${escape(v.remediation)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Stress Testing Results -->
    ${stressData ? `
    <div class="card">
      <h3 style="color:var(--text-heading);margin-bottom:1rem;">📊 Stress & Resilience Testing</h3>
      <div class="meta-grid" style="margin-bottom:1rem;">
        <div class="meta-item">
          <div class="meta-label">Total Requests</div>
          <div class="meta-value">${stressData.totalRequests?.toLocaleString()}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Throughput</div>
          <div class="meta-value">${stressData.requestsPerSecond?.toLocaleString()} RPS</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Success Rate</div>
          <div class="meta-value">${stressData.successRate?.toFixed(1)}%</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Average Latency</div>
          <div class="meta-value">${stressData.latency?.avg} ms</div>
        </div>
      </div>
      <p style="font-size:0.85rem;color:var(--text-muted);">
        Latency: Min ${stressData.latency?.min} ms | Max ${stressData.latency?.max} ms | Failed: ${stressData.failedRequests}
      </p>
    </div>
    ` : ''}

    <!-- Remediation Action Plan -->
    <div class="card" style="border-top: 3px solid var(--cyan);">
      <h3 style="color:var(--text-heading);margin-bottom:0.75rem;">📋 Remediation Priority Roadmap</h3>
      <ol style="padding-left:1.5rem;font-size:0.9rem;line-height:1.8;">
        <li><strong>Immediate (24-48 hours):</strong> Resolve all Critical and High issues (SQL Injection, XSS, Path Traversal) with prepared statements and output encoding.</li>
        <li><strong>Short-term (1-2 weeks):</strong> Configure missing HTTP Security Headers (Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options).</li>
        <li><strong>Medium-term (1 month):</strong> Implement a Web Application Firewall (WAF) and rate limiting to protect against brute force and denial of service.</li>
        <li><strong>Ongoing:</strong> Schedule regular automated dynamic application security scans before each production release.</li>
      </ol>
    </div>

    <div style="text-align:center;color:var(--text-muted);font-size:0.75rem;padding:1.5rem 0;">
      Generated by ${APP_NAME} v${APP_VERSION} &bull; Confidential Security Audit Document
    </div>
  </div>
</body>
</html>`;
}
