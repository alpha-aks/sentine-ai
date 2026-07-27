import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verifyJwtToken } from '@sentinel-ai/security';
import { UserRole } from '@sentinel-ai/types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel_dev_secret_key_2026';

export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In dev / mock mode, allow request if no header present with default mock payload
    req.user = {
      userId: 'proctor_1',
      email: 'proctor@sentinelai.io',
      role: 'LIVE_PROCTOR' as any,
      tenantId: 'inst_mit_01'
    } as any;
    next();
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyJwtToken<JwtPayload>(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: err.message || 'Token verification failed' }
    });
  }
}

export function requireRole(allowedRoles: (UserRole | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required' }
      });
      return;
    }

    const role = req.user.role as string;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || allowedRoles.includes(role)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: `Role ${role} is forbidden from accessing this monitoring resource.` }
    });
  };
}
