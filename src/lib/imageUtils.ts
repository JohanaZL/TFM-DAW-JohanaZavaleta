import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

function getKey(): Buffer {
  const hex = process.env.IMAGE_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('IMAGE_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

// Format: [12 bytes IV][16 bytes auth tag][N bytes ciphertext]
export async function compressAndEncrypt(input: Buffer): Promise<Buffer> {
  const compressed = await gzipAsync(input);
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

export async function decryptAndDecompress(input: Buffer): Promise<Buffer> {
  const key = getKey();
  const iv = input.subarray(0, 12);
  const authTag = input.subarray(12, 28);
  const ciphertext = input.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return gunzipAsync(decrypted);
}
