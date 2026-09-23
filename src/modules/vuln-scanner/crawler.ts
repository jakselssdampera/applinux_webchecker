import * as cheerio from 'cheerio';
import { httpRequest } from '../../core/http-client.js';

export interface CrawlResult {
  urls: string[];
}

/**
 * High-performance Web Crawler with bounded concurrency.
 * Respects same-origin boundaries and crawls discovered internal links.
 */
export async function crawlTarget(
  targetUrl: string,
  maxDepth = 2,
  maxUrls = 20,
  concurrency = 4
): Promise<CrawlResult> {
  const visited = new Set<string>();
  const toVisit: { url: string; depth: number }[] = [{ url: targetUrl, depth: 1 }];

  let baseHost: string;
  try {
    baseHost = new URL(targetUrl).hostname;
  } catch {
    return { urls: [targetUrl] };
  }

  while (toVisit.length > 0 && visited.size < maxUrls) {
    // Take a batch of URLs to process concurrently
    const batchSize = Math.min(concurrency, toVisit.length, maxUrls - visited.size);
    const batch = toVisit.splice(0, batchSize);

    const tasks = batch.map(async (current) => {
      let currentUrlObj: URL;
      try {
        currentUrlObj = new URL(current.url);
        currentUrlObj.hash = ''; // Remove fragments
      } catch {
        return [];
      }

      const urlStr = currentUrlObj.toString();
      if (visited.has(urlStr)) return [];
      visited.add(urlStr);

      if (current.depth >= maxDepth) return [];

      try {
        const response = await httpRequest(urlStr, { method: 'GET', timeout: 8000 });
        const contentType = response.headers['content-type'] as string | undefined;
        if (!contentType?.includes('text/html')) {
          return [];
        }

        const discoveredUrls: { url: string; depth: number }[] = [];
        const $ = cheerio.load(response.body);

        $('a').each((_, el) => {
          const href = $(el).attr('href');
          if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

          try {
            const absoluteUrl = new URL(href, urlStr);
            absoluteUrl.hash = '';
            const absStr = absoluteUrl.toString();

            if (
              absoluteUrl.hostname === baseHost &&
              !visited.has(absStr) &&
              ['http:', 'https:'].includes(absoluteUrl.protocol)
            ) {
              discoveredUrls.push({ url: absStr, depth: current.depth + 1 });
            }
          } catch {
            // Ignore invalid URLs
          }
        });

        return discoveredUrls;
      } catch {
        return [];
      }
    });

    const results = await Promise.allSettled(tasks);
    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const item of res.value) {
          if (!visited.has(item.url) && !toVisit.some((v) => v.url === item.url)) {
            toVisit.push(item);
          }
        }
      }
    }
  }

  return { urls: Array.from(visited) };
}
