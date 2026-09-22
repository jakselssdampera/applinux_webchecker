import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;

/**
 * Derives a 32-byte key from the provided secret using scrypt.
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, 32);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a hex-encoded string: salt + iv + authTag + ciphertext.
 */
export function encrypt(plaintext: string, secret: string): string {
  if (!secret) return plaintext; // No encryption if key not set

  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(secret, salt);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Format: salt(32hex) + iv(32hex) + tag(32hex) + ciphertext
  return salt.toString('hex') + iv.toString('hex') + authTag.toString('hex') + encrypted;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 */
export function decrypt(encryptedHex: string, secret: string): string {
  if (!secret) return encryptedHex; // No decryption if key not set

  const saltHexLength = SALT_LENGTH * 2;
  const ivHexLength = IV_LENGTH * 2;
  const tagHexLength = TAG_LENGTH * 2;

  const salt = Buffer.from(encryptedHex.slice(0, saltHexLength), 'hex');
  const key = deriveKey(secret, salt);

  const iv = Buffer.from(encryptedHex.slice(saltHexLength, saltHexLength + ivHexLength), 'hex');
  const authTag = Buffer.from(encryptedHex.slice(saltHexLength + ivHexLength, saltHexLength + ivHexLength + tagHexLength), 'hex');
  const ciphertext = encryptedHex.slice(saltHexLength + ivHexLength + tagHexLength);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
