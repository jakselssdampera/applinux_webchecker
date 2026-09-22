import { httpRequest } from '../../../core/http-client.js';
import type { Vulnerability } from '../types.js';

const SQLI_PAYLOADS = [
  "'",
  "\"",
  "' OR '1'='1",
  "1' ORDER BY 1--+",
];

const SQL_ERRORS = [
  'syntax error near',
  'mysql_fetch',
  'SQL syntax',
  'ORA-01756',
  'PostgreSQL query failed',
  'SQLite3::SQLException'
];

export async function analyzeSqli(urls: string[]): Promise<Vulnerability[]> {
  const vulns: Vulnerability[] = [];

  for (const target of urls) {
    let urlObj: URL;
    try {
      urlObj = new URL(target);
    } catch {
      continue;
    }

    const params = Array.from(urlObj.searchParams.keys());
    if (params.length === 0) continue; // No parameters to test

    for (const param of params) {
      const originalValue = urlObj.searchParams.get(param) || '';

      for (const payload of SQLI_PAYLOADS) {
        // Construct new URL with payload
        const testUrlObj = new URL(target);
        testUrlObj.searchParams.set(param, originalValue + payload);
        const testUrl = testUrlObj.toString();

        try {
          const response = await httpRequest(testUrl, { method: 'GET' });
          const text = response.body;

          const foundError = SQL_ERRORS.find(err => text.includes(err));
          if (foundError) {
            vulns.push({
              id: 'SQLI_ERROR_BASED',
              title: 'Error-Based SQL Injection',
              description: `Parameter '${param}' appears to be vulnerable to SQL Injection.`,
              severity: 'critical',
              url: testUrl,
              parameter: param,
              evidence: `Payload injected: ${payload}. Response contained SQL error: "${foundError}"`,
              remediation: 'Use parameterized queries (Prepared Statements) for all database operations. Never concatenate user input directly into SQL strings.'
            });
            break; // Stop testing other payloads for this parameter if we already found a vulnerability
          }
        } catch {
          // Ignore network errors
        }
      }
    }
  }

  return vulns;
}
