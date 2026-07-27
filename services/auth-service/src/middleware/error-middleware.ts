import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '@sentinel-ai/types';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err instanceof Error ? err.message : String(err);
  let status = 500;
  let code = 'AUTH_SERVER_ERROR';

  if (message.startsWith('AUTH_INVALID_EMAIL') || message.startsWith('AUTH_WEAK_PASSWORD') || message.startsWith('AUTH_INVALID_MFA_CODE')) {
    status = 400;
    code = message.split(':')[0];
  } else if (message.startsWith('AUTH_EMAIL_EXISTS')) {
    status = 409;
    code = message.split(':')[0];
  } else if (message.startsWith('AUTH_INVALID_CREDENTIALS') || message.startsWith('AUTH_MISSING_TOKEN') || message.startsWith('AUTH_INVALID_TOKEN') || message.startsWith('AUTH_TOKEN_EXPIRED')) {
    status = 401;
    code = message.split(':')[0];
  } else if (message.startsWith('AUTH_ACCOUNT_LOCKED')) {
    status = 423; // Locked
    code = message.split(':')[0];
  } else if (message.startsWith('AUTH_EMAIL_NOT_VERIFIED') || message.startsWith('AUTH_ACCOUNT_DISABLED') || message.startsWith('AUTH_TOKEN_REVOKED')) {
    status = 403;
    code = message.split(':')[0];
  } else if (message.startsWith('AUTH_USER_NOT_FOUND')) {
    status = 404;
    code = message.split(':')[0];
  }

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message: message.includes(':') ? message.substring(message.indexOf(':') + 1).trim() : message,
      details: []
    },
    meta: {
      requestId: (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  };

  res.status(status).json(errorResponse);
}
