import { Response, NextFunction } from 'express';
import { verifyJwtToken } from '@sentinel-ai/security';
import { AuthenticatedRequest } from './request-id.middleware';

export { AuthenticatedRequest };

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel_jwt_secret_key_2026';

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const tenantHeader = req.headers['x-institution-id'] as string;

  if (!tenantHeader) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_TENANT_ID', message: 'Header x-institution-id is required' }
    });
    return;
  }

  req.tenantId = tenantHeader;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyJwtToken(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' }
    });
  }
}

export const authenticateJwt = authMiddleware;
export const enforceTenantIsolation = authMiddleware;
export const visionRateLimiter = (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => next();
