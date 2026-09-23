import { describe, it, expect } from 'vitest';
import { generateHtmlReport } from '../src/core/report-generator.js';

describe('Report Generator (PRD Section 5)', () => {
  it('should generate a valid HTML report with Grade A when no vulnerabilities exist', () => {
    const html = generateHtmlReport({
      id: 'test-scan-1',
      targetUrl: 'https://secure-target.example.com',
      targetIp: '93.184.216.34',
      status: 'completed',
      modules: ['profiler', 'vuln-scanner'],
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      results: [
        {
          module: 'vuln-scanner',
          data: { vulnerabilities: [] },
        },
      ],
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Security Audit Report');
    expect(html).toContain('secure-target.example.com');
    expect(html).toContain('class="grade-letter">A<');
    expect(html).toContain('100/100');
  });

  it('should reduce score and calculate Grade F when critical vulnerabilities are present', () => {
    const html = generateHtmlReport({
      id: 'test-scan-2',
      targetUrl: 'https://vulnerable-target.example.com',
      targetIp: '93.184.216.34',
      status: 'completed',
      modules: ['vuln-scanner', 'exploit-sim'],
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      results: [
        {
          module: 'vuln-scanner',
          data: {
            vulnerabilities: [
              { severity: 'critical', title: 'SQL Injection', description: 'desc', url: 'https://vulnerable-target.example.com/api', remediation: 'fix' },
              { severity: 'critical', title: 'Path Traversal', description: 'desc', url: 'https://vulnerable-target.example.com/file', remediation: 'fix' },
            ],
          },
        },
        {
          module: 'exploit-sim',
          data: {
            findings: [
              { severity: 'critical', vulnType: 'RCE', verificationStatus: 'confirmed', curlCommand: 'curl ...', evidence: '...', remediation: '...' },
            ],
          },
        },
      ],
    });

    expect(html).toContain('class="grade-letter">F<');
    expect(html).toContain('Executive Security Assessment');
    expect(html).toContain('Critical / High');
  });

  it('should escape HTML in targetUrl to prevent report injection', () => {
    const xssPayload = '<script>alert("report-xss")</script>';
    const html = generateHtmlReport({
      id: 'test-scan-3',
      targetUrl: `https://example.com/${xssPayload}`,
      targetIp: '1.2.3.4',
      status: 'completed',
      modules: ['profiler'],
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      results: [],
    });

    expect(html).not.toContain('<script>alert("report-xss")</script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;report-xss&quot;)&lt;/script&gt;');
  });
});
