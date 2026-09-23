import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../src/utils/crypto.js';

describe('Crypto Module (AES-256-GCM)', () => {
  const testKey = 'test-secret-encryption-key-32bytes!';
  const plaintext = 'Sensitive security scan findings and vulnerabilities';

  it('should encrypt and decrypt plaintext successfully', () => {
    const encrypted = encrypt(plaintext, testKey);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(plaintext);

    const decrypted = decrypt(encrypted, testKey);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for the same plaintext (random salt + IV)', () => {
    const enc1 = encrypt(plaintext, testKey);
    const enc2 = encrypt(plaintext, testKey);

    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1, testKey)).toBe(plaintext);
    expect(decrypt(enc2, testKey)).toBe(plaintext);
  });

  it('should fail decryption when given wrong key', () => {
    const encrypted = encrypt(plaintext, testKey);
    expect(() => decrypt(encrypted, 'wrong-key-12345')).toThrow();
  });

  it('should fail decryption when ciphertext is tampered with', () => {
    const encrypted = encrypt(plaintext, testKey);
    const parts = encrypted.split(':');
    // Tamper with the ciphertext component
    parts[2] = 'tamperedData123';
    expect(() => decrypt(parts.join(':'), testKey)).toThrow();
  });
});
