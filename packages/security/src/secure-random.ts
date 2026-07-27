import crypto from 'crypto';

export function secureRandomHex(lengthBytes: number = 32): string {
  return crypto.randomBytes(lengthBytes).toString('hex');
}

export function secureRandomToken(lengthBytes: number = 32): string {
  return crypto
    .randomBytes(lengthBytes)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function secureRandomNumber(min: number, max: number): number {
  if (min >= max) {
    throw new Error('min must be strictly less than max');
  }
  const range = max - min;
  const randomBuffer = crypto.randomBytes(4);
  const randomNumber = randomBuffer.readUInt32BE(0);
  return min + (randomNumber % range);
}

export function secureRandomString(
  length: number = 16,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  if (length <= 0) return '';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

export function secureRandomBytes(length: number): Buffer {
  return crypto.randomBytes(length);
}

export function constantTimeCompare(a: string | Buffer, b: string | Buffer): boolean {
  const bufA = typeof a === 'string' ? Buffer.from(a, 'utf8') : a;
  const bufB = typeof b === 'string' ? Buffer.from(b, 'utf8') : b;

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
