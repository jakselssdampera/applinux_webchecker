import type { IModule, ProfileResult, DetectedTechnology } from './types.js';
import { httpRequest } from '../../core/http-client.js';
import { analyzeHeaders } from './header-analyzer.js';
import { analyzeHtml } from './html-analyzer.js';
import { detectWaf } from './waf-detector.js';
import { MODULE_NAMES } from '../../utils/constants.js';

/**
 * Technology Profiler Module
 *
 * Analyzes a target URL and identifies:
 * - Web server (Nginx, Apache, IIS, etc.)
 * - Programming language (PHP, Node.js, Python, etc.)
 * - Framework (Laravel, Django, Next.js, etc.)
 * - CMS (WordPress, Joomla, Drupal, etc.)
 * - JavaScript libraries (React, Vue, Angular, jQuery)
 * - CSS frameworks (Bootstrap, Tailwind)
 * - WAF/CDN (Cloudflare, Akamai, AWS)
 * - OS (Ubuntu, Debian, Windows Server)
 */
export class ProfilerModule implements IModule {
  name = MODULE_NAMES.PROFILER;

  async run(targetUrl: string, targetIp: string | null): Promise<ProfileResult> {
    const startTime = Date.now();

    // ─── Fetch the target page ────────────────────
    const response = await httpRequest(targetUrl);
    const responseTime = Date.now() - startTime;

    // ─── Run all analyzers ────────────────────────
    const headerTechs = analyzeHeaders(response.headers);
    const htmlTechs = analyzeHtml(response.body);
    const wafTechs = await detectWaf(targetUrl, response.headers);

    // ─── Merge & deduplicate results ──────────────
    const technologies = this.mergeTechnologies([
      ...headerTechs,
      ...htmlTechs,
      ...wafTechs,
    ]);

    // Sort by confidence (highest first)
    technologies.sort((a, b) => b.confidence - a.confidence);

    return {
      targetUrl: response.url,
      targetIp,
      technologies,
      headers: response.headers,
      responseTime,
      statusCode: response.statusCode,
      redirectChain: response.redirectUrls,
      scannedAt: new Date().toISOString(),
    };
  }

  /**
   * Merge duplicate technology detections, keeping the highest confidence
   * and combining evidence strings.
   */
  private mergeTechnologies(techs: DetectedTechnology[]): DetectedTechnology[] {
    const merged = new Map<string, DetectedTechnology>();

    for (const tech of techs) {
      const key = tech.name;
      const existing = merged.get(key);

      if (existing) {
        if (tech.confidence > existing.confidence) {
          existing.confidence = tech.confidence;
        }
        // Append evidence if different
        if (!existing.evidence.includes(tech.evidence)) {
          existing.evidence += ` | ${tech.evidence}`;
        }
        if (tech.version && !existing.version) {
          existing.version = tech.version;
        }
      } else {
        merged.set(key, { ...tech });
      }
    }

    return Array.from(merged.values());
  }
}
