import type { DetectedTechnology } from './types.js';
import { TECH_SIGNATURES } from './tech-signatures.js';

/**
 * Analyzes HTTP response headers to fingerprint technologies.
 * Checks Server, X-Powered-By, Set-Cookie, and other revealing headers.
 */
export function analyzeHeaders(
  headers: Record<string, string | string[] | undefined>
): DetectedTechnology[] {
  const detected: DetectedTechnology[] = [];

  for (const sig of TECH_SIGNATURES) {
    for (const pattern of sig.patterns) {
      if (pattern.source !== 'header' && pattern.source !== 'cookie') continue;

      let valueToCheck: string | undefined;

      if (pattern.source === 'cookie') {
        // Check Set-Cookie and Cookie headers for cookie name patterns
        const setCookie = headers['set-cookie'];
        valueToCheck = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
      } else if (pattern.key) {
        const headerVal = headers[pattern.key.toLowerCase()];
        valueToCheck = Array.isArray(headerVal) ? headerVal.join(', ') : headerVal;
      }

      if (!valueToCheck) continue;

      const match = valueToCheck.match(pattern.pattern);
      if (match) {
        const version =
          pattern.versionGroup !== undefined
            ? match[pattern.versionGroup] ?? undefined
            : undefined;

        // Check if already detected with higher confidence
        const existing = detected.find((d) => d.name === sig.name);
        if (existing) {
          if (pattern.confidence > existing.confidence) {
            existing.confidence = pattern.confidence;
            existing.evidence = `Header [${pattern.key ?? 'set-cookie'}]: ${match[0]}`;
            if (version) existing.version = version;
          }
        } else {
          detected.push({
            name: sig.name,
            category: sig.category,
            version,
            confidence: pattern.confidence,
            evidence: `Header [${pattern.key ?? 'set-cookie'}]: ${match[0]}`,
          });
        }
      }
    }
  }

  return detected;
}
