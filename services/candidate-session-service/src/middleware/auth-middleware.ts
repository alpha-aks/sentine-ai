import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verifyJwtToken, hasPermission, Permission } from '@sentinel-ai/security';
import { UserRole } from '@sentinel-ai/types';
import { getSessionServiceConfig } from '../config/session-config';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'SESSION_UNAUTHORIZED', message: 'Authentication token missing or invalid', details: [] },
      meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), path: req.originalUrl }
    });
    return;
  }

  const token = authHeader.substring(7);
  const config = getSessionServiceConfig();

  try {
    const payload = verifyJwtToken<JwtPayload>(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { code: 'SESSION_INVALID_TOKEN', message: err.message || 'Token verification failed', details: [] },
      meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        error: { code: 'SESSION_UNAUTHORIZED', message: 'User authentication required', details: [] },
        meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), path: req.originalUrl }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'SESSION_FORBIDDEN',
          message: `Insufficient permissions. Role ${req.user.role} cannot perform this operation.`,
          details: []
        },
        meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), path: req.originalUrl }
      });
      return;
    }

    next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        error: { code: 'SESSION_UNAUTHORIZED', message: 'User authentication required', details: [] },
        meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), path: req.originalUrl }
      });
      return;
    }

    if (!hasPermission(req.user.role as UserRole, permission)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'SESSION_FORBIDDEN',
          message: `Permission "${permission}" is required for this operation.`,
          details: []
        },
        meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), path: req.originalUrl }
      });
      return;
    }

    next();
  };
}

const ipRequestCounts: Map<string, { count: number; resetAt: number }> = new Map();

export function rateLimiter(maxRequests: number = 60, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = ipRequestCounts.get(ip);

    if (!record || now > record.resetAt) {
      ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    record.count++;
    if (record.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: { code: 'SESSION_RATE_LIMITED', message: 'Too many requests. Please slow down.', details: [] },
        meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), path: req.originalUrl }
      });
      return;
    }

    next();
  };
}
