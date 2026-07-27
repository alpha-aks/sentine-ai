import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits standard for GCM

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  version?: string;
}

function deriveKey(secretKey: string): Buffer {
  if (!secretKey) {
    throw new Error('Encryption secretKey cannot be empty');
  }
  return crypto.createHash('sha256').update(secretKey).digest();
}

export function encryptAesGcm(plainText: string, secretKey: string): EncryptedPayload {
  if (plainText === undefined || plainText === null) {
    throw new Error('plainText must be provided for encryption');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(secretKey);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plainText, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag,
    version: 'v1'
  };
}

export function decryptAesGcm(payload: EncryptedPayload, secretKey: string): string {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error('Decryption failed: EncryptedPayload must include ciphertext, iv, and authTag');
  }

  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');
  const key = deriveKey(secretKey);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plainText = decipher.update(payload.ciphertext, 'hex', 'utf8');
  plainText += decipher.final('utf8');

  return plainText;
}

export function encryptBuffer(data: Buffer, secretKey: string): EncryptedPayload {
  if (!Buffer.isBuffer(data)) {
    throw new Error('data must be a Buffer');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(secretKey);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]).toString('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag,
    version: 'v1'
  };
}

export function decryptBuffer(payload: EncryptedPayload, secretKey: string): Buffer {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error('Decryption failed: EncryptedPayload must include ciphertext, iv, and authTag');
  }

  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');
  const key = deriveKey(secretKey);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, 'hex')), decipher.final()]);
}
