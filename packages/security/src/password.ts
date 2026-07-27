import crypto from 'crypto';

const KEY_LEN = 64;
const DEFAULT_ITERATIONS = 100000;
const DIGEST = 'sha512';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  entropyBits: number;
  feedback: string[];
}

export async function hashPassword(
  password: string,
  saltHex?: string,
  iterations: number = DEFAULT_ITERATIONS
): Promise<string> {
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  return new Promise((resolve, reject) => {
    const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(32);
    crypto.pbkdf2(password, salt, iterations, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      const hashHex = derivedKey.toString('hex');
      const saltString = salt.toString('hex');
      resolve(`${iterations}:${saltString}:${hashHex}`);
    });
  });
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) {
    return false;
  }

  const parts = storedHash.split(':');
  let iterations = DEFAULT_ITERATIONS;
  let saltHex = '';
  let originalHash = '';

  if (parts.length === 3) {
    iterations = parseInt(parts[0], 10) || DEFAULT_ITERATIONS;
    saltHex = parts[1];
    originalHash = parts[2];
  } else if (parts.length === 2) {
    // Legacy format support
    saltHex = parts[0];
    originalHash = parts[1];
  } else {
    return false;
  }

  if (!saltHex || !originalHash) {
    return false;
  }

  try {
    const computedFullHash = await hashPassword(password, saltHex, iterations);
    const computedParts = computedFullHash.split(':');
    const computedHash = computedParts[computedParts.length - 1];

    const origBuf = Buffer.from(originalHash, 'hex');
    const compBuf = Buffer.from(computedHash, 'hex');

    if (origBuf.length !== compBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(origBuf, compBuf);
  } catch {
    return false;
  }
}

export function validatePasswordStrength(
  password: string,
  minLength: number = 8
): PasswordStrengthResult {
  const feedback: string[] = [];

  const hasMinLength = (password || '').length >= minLength;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength) feedback.push(`Password must be at least ${minLength} characters long`);
  if (!hasUppercase) feedback.push('Password must contain at least one uppercase letter');
  if (!hasLowercase) feedback.push('Password must contain at least one lowercase letter');
  if (!hasNumber) feedback.push('Password must contain at least one digit');
  if (!hasSpecialChar) feedback.push('Password must contain at least one special character');

  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSpecialChar) poolSize += 32;

  const entropyBits = Math.round((password.length || 0) * (poolSize > 0 ? Math.log2(poolSize) : 0));

  let score = 0;
  if (entropyBits >= 28) score = 1;
  if (entropyBits >= 36 && hasMinLength) score = 2;
  if (entropyBits >= 60 && hasMinLength && (hasUppercase || hasSpecialChar)) score = 3;
  if (
    entropyBits >= 80 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar
  )
    score = 4;

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return {
    score,
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    entropyBits,
    feedback
  };
}
