import { describe, it, expect } from 'vitest';
import { validateTargetUrl } from '../src/utils/url-validator.js';

describe('URL Validator (SSRF Protection)', () => {
  it('should accept valid public URLs', async () => {
    const result = await validateTargetUrl('https://example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com/');
    expect(result.hostname).toBe('example.com');
  });

  it('should normalize URLs without protocol prefix', async () => {
    const result = await validateTargetUrl('example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com/');
  });

  it('should reject non-http/https protocols', async () => {
    const ftp = await validateTargetUrl('ftp://example.com');
    expect(ftp.valid).toBe(false);
    expect(ftp.error).toContain('Only http and https protocols are allowed');

    const file = await validateTargetUrl('file:///etc/passwd');
    expect(file.valid).toBe(false);
  });

  it('should block IPv4 loopback (127.0.0.1) as private IP', async () => {
    const result = await validateTargetUrl('http://127.0.0.1:3000');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('private/internal IP');
  });

  it('should block Class A private network (10.x.x.x)', async () => {
    const result = await validateTargetUrl('http://10.0.0.1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('private/internal IP');
  });

  it('should block Class C private network (192.168.x.x)', async () => {
    const result = await validateTargetUrl('http://192.168.1.1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('private/internal IP');
  });

  it('should block localhost hostname resolution', async () => {
    const result = await validateTargetUrl('http://localhost:8080');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('private/internal IP');
  });
});
