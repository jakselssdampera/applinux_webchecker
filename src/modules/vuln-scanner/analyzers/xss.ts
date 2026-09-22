import { httpRequest } from '../../../core/http-client.js';
import type { Vulnerability } from '../types.js';

const XSS_PAYLOADS = [
  '<script>alert("WSA_XSS")</script>',
  '"><script>alert("WSA_XSS")</script>',
  '<img src=x onerror=alert("WSA_XSS")>'
];

export async function analyzeXss(urls: string[]): Promise<Vulnerability[]> {
  const vulns: Vulnerability[] = [];

  for (const target of urls) {
    let urlObj: URL;
    try {
      urlObj = new URL(target);
    } catch {
      continue;
    }

    const params = Array.from(urlObj.searchParams.keys());
    if (params.length === 0) continue;

    for (const param of params) {
      for (const payload of XSS_PAYLOADS) {
        const testUrlObj = new URL(target);
        testUrlObj.searchParams.set(param, payload);
        const testUrl = testUrlObj.toString();

        try {
          const response = await httpRequest(testUrl, { method: 'GET' });
          const contentType = response.headers['content-type'] as string | undefined;
          if (!contentType?.includes('text/html')) {
            continue; // XSS only applies if response is HTML
          }

          const text = response.body;

          // Check if payload is reflected exactly (not HTML-encoded)
          if (text.includes(payload)) {
            vulns.push({
              id: 'XSS_REFLECTED',
              title: 'Reflected Cross-Site Scripting (XSS)',
              description: `Parameter '${param}' reflects user input without encoding.`,
              severity: 'high',
              url: testUrl,
              parameter: param,
              evidence: `Payload ${payload} was reflected in the HTML response unmodified.`,
              remediation: 'Encode all user input before reflecting it in HTML (context-aware output encoding).'
            });
            break;
          }
        } catch {
          // Ignore network errors
        }
      }
    }
  }

  return vulns;
}
