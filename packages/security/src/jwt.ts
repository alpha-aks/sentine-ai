import crypto from 'crypto';

function base64UrlEncode(str: string | Buffer): string {
  const buf = typeof str === 'string' ? Buffer.from(str) : str;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export interface JwtPayload {
  sub: string;
  role?: string;
  institutionId?: string;
  iss?: string;
  aud?: string;
  nbf?: number;
  iat?: number;
  exp?: number;
  jti?: string;
  [key: string]: any;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion?: number;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface JwtVerifyOptions {
  issuer?: string;
  audience?: string;
  ignoreExpiration?: boolean;
}

export function signJwtToken(
  payload: JwtPayload,
  secret: string,
  expiresInSeconds: number = 86400
): string {
  if (!secret) {
    throw new Error('JWT signing failed: Secret must be provided');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSeconds = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    ...payload,
    iat: payload.iat ?? nowSeconds,
    exp: payload.exp ?? nowSeconds + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest();

  const encodedSignature = base64UrlEncode(signature);

  return `${dataToSign}.${encodedSignature}`;
}

export function verifyJwtToken<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string,
  options: JwtVerifyOptions = {}
): T {
  if (!token || typeof token !== 'string') {
    throw new Error('JWT verification failed: Token must be a non-empty string');
  }

  if (!secret) {
    throw new Error('JWT verification failed: Secret key is required');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('JWT verification failed: Malformed token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(dataToSign).digest()
  );

  const sigBuf = Buffer.from(encodedSignature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('JWT verification failed: Invalid signature');
  }

  let payload: T;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw new Error('JWT verification failed: Invalid payload JSON');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  if (!options.ignoreExpiration && payload.exp && payload.exp < nowSeconds) {
    throw new Error('JWT verification failed: Token has expired');
  }

  if (payload.nbf && payload.nbf > nowSeconds) {
    throw new Error('JWT verification failed: Token not active yet');
  }

  if (options.issuer && payload.iss !== options.issuer) {
    throw new Error(
      `JWT verification failed: Issuer mismatch (expected ${options.issuer}, got ${payload.iss})`
    );
  }

  if (options.audience && payload.aud !== options.audience) {
    throw new Error(
      `JWT verification failed: Audience mismatch (expected ${options.audience}, got ${payload.aud})`
    );
  }

  return payload;
}

export function decodeJwtToken<T extends JwtPayload = JwtPayload>(token: string): T | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as T;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtToken(token);
  if (!payload || !payload.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowSeconds;
}

export function signRefreshToken(
  payload: RefreshTokenPayload,
  secret: string,
  expiresInDays: number = 7
): string {
  const expiresInSeconds = expiresInDays * 86400;
  return signJwtToken(
    {
      ...payload,
      tokenType: 'refresh'
    },
    secret,
    expiresInSeconds
  );
}

export function verifyRefreshToken(token: string, secret: string): RefreshTokenPayload {
  const payload = verifyJwtToken<RefreshTokenPayload & { tokenType?: string }>(token, secret);
  if (payload.tokenType !== 'refresh') {
    throw new Error('JWT verification failed: Token is not a valid refresh token');
  }
  return payload;
}
