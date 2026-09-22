import { crawlTarget } from './crawler.js';
import { analyzeMisconfig } from './analyzers/misconfig.js';
import { analyzeSqli } from './analyzers/sqli.js';
import { analyzeXss } from './analyzers/xss.js';
import type { VulnScannerResult, Vulnerability } from './types.js';

export class VulnScannerModule {
  async run(targetUrl: string, _targetIp: string | null): Promise<VulnScannerResult> {
    const allVulns: Vulnerability[] = [];

    // 1. Crawl to find internal URLs
    const crawlData = await crawlTarget(targetUrl, 2, 20); // Depth 2, max 20 URLs
    const urlsToTest = crawlData.urls;

    if (urlsToTest.length === 0) {
      urlsToTest.push(targetUrl); // Fallback to test at least the root
    }

    // 2. Run Analyzers
    
    // a. Misconfiguration (only needs to run once against the base URL)
    const misconfigVulns = await analyzeMisconfig(targetUrl);
    allVulns.push(...misconfigVulns);

    // b. SQL Injection (test all discovered URLs with parameters)
    const sqliVulns = await analyzeSqli(urlsToTest);
    allVulns.push(...sqliVulns);

    // c. Cross-Site Scripting (XSS) (test all discovered URLs with parameters)
    const xssVulns = await analyzeXss(urlsToTest);
    allVulns.push(...xssVulns);

    return {
      targetUrl,
      vulnerabilities: allVulns,
      crawledUrls: urlsToTest,
      scannedAt: new Date().toISOString()
    };
  }
}
