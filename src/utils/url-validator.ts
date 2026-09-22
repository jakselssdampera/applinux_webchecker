import { URL } from 'node:url';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/** Private/reserved IP ranges that should be blocked (SSRF protection) */
const PRIVATE_RANGES = [
  /^127\./,               // Loopback
  /^10\./,                // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./,          // Class C private
  /^169\.254\./,          // Link-local
  /^0\./,                 // Current network
  /^::1$/,                // IPv6 loopback
  /^fc00:/i,              // IPv6 unique local
  /^fe80:/i,              // IPv6 link-local
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_RANGES.some((range) => range.test(ip));
}

export interface UrlValidationResult {
  valid: boolean;
  url?: string;
  hostname?: string;
  ip?: string;
  error?: string;
}

/**
 * Validates and normalizes a target URL.
 * - Must be http or https
 * - Resolves hostname to IP
 * - Blocks private/internal IPs (SSRF protection)
 */
export async function validateTargetUrl(
  input: string,
  allowPrivate = false
): Promise<UrlValidationResult> {
  // Normalize: add protocol if missing
  let rawUrl = input.trim();
  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = `https://${rawUrl}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Protocol check
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only http and https protocols are allowed' };
  }

  const hostname = parsed.hostname;

  // Resolve IP
  let ip: string;
  if (isIP(hostname)) {
    ip = hostname;
  } else {
    try {
      const result = await lookup(hostname);
      ip = result.address;
    } catch {
      return { valid: false, error: `Could not resolve hostname: ${hostname}` };
    }
  }

  // SSRF protection
  if (!allowPrivate && isPrivateIp(ip)) {
    return { valid: false, error: 'Target resolves to a private/internal IP address' };
  }

  return {
    valid: true,
    url: parsed.toString(),
    hostname,
    ip,
  };
}
