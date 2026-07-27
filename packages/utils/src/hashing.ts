import crypto from 'crypto';

export function sha256Hash(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function sha512Hash(content: string | Buffer): string {
  return crypto.createHash('sha512').update(content).digest('hex');
}

export function hmacSha256(content: string | Buffer, secret: string): string {
  return crypto.createHmac('sha256', secret).update(content).digest('hex');
}

export function hmacSha512(content: string | Buffer, secret: string): string {
  return crypto.createHmac('sha512', secret).update(content).digest('hex');
}

export function md5Hash(content: string | Buffer): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Fast 32-bit FNV-1a hash calculation for strings (useful for caching keys and fast index lookups)
 */
export function fastHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}
