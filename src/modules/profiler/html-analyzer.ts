import * as cheerio from 'cheerio';
import type { DetectedTechnology } from './types.js';
import { TECH_SIGNATURES } from './tech-signatures.js';

/**
 * Analyzes HTML content to fingerprint technologies.
 * Uses cheerio for parsing and checks meta tags, scripts, link tags, and HTML patterns.
 */
export function analyzeHtml(htmlBody: string): DetectedTechnology[] {
  const detected: DetectedTechnology[] = [];
  const $ = cheerio.load(htmlBody);

  // Extract useful HTML fragments for pattern matching
  const metaGenerators = $('meta[name="generator"]')
    .map((_, el) => $(el).attr('content') ?? '')
    .get();

  const scriptSrcs = $('script[src]')
    .map((_, el) => $(el).attr('src') ?? '')
    .get();

  const linkHrefs = $('link[href]')
    .map((_, el) => $(el).attr('href') ?? '')
    .get();

  // Combine all inline script text
  const inlineScripts = $('script:not([src])')
    .map((_, el) => $(el).html() ?? '')
    .get()
    .join('\n');

  for (const sig of TECH_SIGNATURES) {
    for (const pattern of sig.patterns) {
      let matched = false;
      let evidence = '';
      let version: string | undefined;

      switch (pattern.source) {
        case 'meta': {
          for (const gen of metaGenerators) {
            const match = gen.match(pattern.pattern);
            if (match) {
              matched = true;
              evidence = `Meta generator: ${gen}`;
              version =
                pattern.versionGroup !== undefined
                  ? match[pattern.versionGroup] ?? undefined
                  : undefined;
              break;
            }
          }
          break;
        }

        case 'script': {
          for (const src of scriptSrcs) {
            const match = src.match(pattern.pattern);
            if (match) {
              matched = true;
              evidence = `Script src: ${src}`;
              version =
                pattern.versionGroup !== undefined
                  ? match[pattern.versionGroup] ?? undefined
                  : undefined;
              break;
            }
          }
          // Also check inline scripts
          if (!matched) {
            const match = inlineScripts.match(pattern.pattern);
            if (match) {
              matched = true;
              evidence = `Inline script pattern: ${match[0].slice(0, 80)}`;
              version =
                pattern.versionGroup !== undefined
                  ? match[pattern.versionGroup] ?? undefined
                  : undefined;
            }
          }
          break;
        }

        case 'html': {
          // Check full HTML body for patterns
          const match = htmlBody.match(pattern.pattern);
          if (match) {
            matched = true;
            evidence = `HTML pattern: ${match[0].slice(0, 80)}`;
            version =
              pattern.versionGroup !== undefined
                ? match[pattern.versionGroup] ?? undefined
                : undefined;
          }
          break;
        }

        case 'url': {
          // Check script srcs and link hrefs
          const allUrls = [...scriptSrcs, ...linkHrefs];
          for (const urlStr of allUrls) {
            const match = urlStr.match(pattern.pattern);
            if (match) {
              matched = true;
              evidence = `Resource URL: ${urlStr}`;
              version =
                pattern.versionGroup !== undefined
                  ? match[pattern.versionGroup] ?? undefined
                  : undefined;
              break;
            }
          }
          break;
        }
      }

      if (matched) {
        const existing = detected.find((d) => d.name === sig.name);
        if (existing) {
          if (pattern.confidence > existing.confidence) {
            existing.confidence = pattern.confidence;
            existing.evidence = evidence;
            if (version) existing.version = version;
          }
        } else {
          detected.push({
            name: sig.name,
            category: sig.category,
            version,
            confidence: pattern.confidence,
            evidence,
          });
        }
      }
    }
  }

  return detected;
}
