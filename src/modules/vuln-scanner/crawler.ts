import * as cheerio from 'cheerio';
import { httpRequest } from '../../core/http-client.js';

export interface CrawlResult {
  urls: string[];
}

/**
 * Basic Web Crawler to find internal links.
 * It respects same-origin boundaries and avoids crawling external links.
 */
export async function crawlTarget(
  targetUrl: string,
  maxDepth = 2,
  maxUrls = 20
): Promise<CrawlResult> {
  const visited = new Set<string>();
  const toVisit: { url: string; depth: number }[] = [{ url: targetUrl, depth: 1 }];
  const baseHost = new URL(targetUrl).hostname;

  while (toVisit.length > 0 && visited.size < maxUrls) {
    const current = toVisit.shift()!;
    
    // Normalize URL
    let currentUrlObj: URL;
    try {
      currentUrlObj = new URL(current.url);
      currentUrlObj.hash = ''; // Remove fragments
    } catch {
      continue;
    }
    
    const urlStr = currentUrlObj.toString();
    
    if (visited.has(urlStr)) continue;
    visited.add(urlStr);

    if (current.depth >= maxDepth) continue;

    try {
      const response = await httpRequest(urlStr, { method: 'GET' });
      const contentType = response.headers['content-type'] as string | undefined;
      if (!contentType?.includes('text/html')) {
        continue;
      }
      
      const html = response.body;
      const $ = cheerio.load(html);
      
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        
        try {
          const absoluteUrl = new URL(href, urlStr);
          if (absoluteUrl.hostname === baseHost && !visited.has(absoluteUrl.toString())) {
            toVisit.push({ url: absoluteUrl.toString(), depth: current.depth + 1 });
          }
        } catch {
          // Ignore invalid URLs
        }
      });
    } catch (err) {
      // Skip on error
    }
  }

  return { urls: Array.from(visited) };
}
