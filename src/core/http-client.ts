import { request } from 'undici';
import { DEFAULT_USER_AGENT, HTTP_TIMEOUT_MS, MAX_REDIRECTS } from '../utils/constants.js';

export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  url: string;
  redirectUrls: string[];
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  maxRedirects?: number;
  followRedirects?: boolean;
}

/**
 * Shared HTTP client built on undici for high-performance requests.
 * Used by all scanner modules.
 */
export async function httpRequest(
  url: string,
  options: HttpRequestOptions = {}
): Promise<HttpResponse> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = HTTP_TIMEOUT_MS,
    maxRedirects = MAX_REDIRECTS,
  } = options;

  const redirectUrls: string[] = [];
  let currentUrl = url;
  let redirectCount = 0;
  let lastResponse: Awaited<ReturnType<typeof request>> | null = null;

  // Manual redirect following to capture all redirect URLs
  while (redirectCount <= maxRedirects) {
    const response = await request(currentUrl, {
      method,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...headers,
      },
      body,
      bodyTimeout: timeout,
      headersTimeout: timeout,
      maxRedirections: 0,
    } as Parameters<typeof request>[1]);

    lastResponse = response;

    // Check for redirect
    const location = response.headers['location'];
    if (
      location &&
      [301, 302, 303, 307, 308].includes(response.statusCode)
    ) {
      redirectUrls.push(currentUrl);
      // Resolve relative URLs
      currentUrl = new URL(location as string, currentUrl).toString();
      redirectCount++;
      // Consume body to free connection
      await response.body.text();
      continue;
    }

    break;
  }

  if (!lastResponse) {
    throw new Error(`Failed to get response from ${url}`);
  }

  const responseBody = await lastResponse.body.text();

  // Flatten headers to Record<string, string>
  const flatHeaders: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(lastResponse.headers)) {
    flatHeaders[key.toLowerCase()] = value;
  }

  return {
    statusCode: lastResponse.statusCode,
    headers: flatHeaders,
    body: responseBody,
    url: currentUrl,
    redirectUrls,
  };
}
