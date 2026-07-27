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
  let code = 'USER_SERVER_ERROR';

  if (message.startsWith('USER_INVALID_EMAIL') || message.startsWith('USER_INVALID_INPUT')) {
    status = 400;
    code = message.split(':')[0];
  } else if (message.startsWith('USER_EMAIL_EXISTS')) {
    status = 409;
    code = message.split(':')[0];
  } else if (message.startsWith('USER_UNAUTHORIZED') || message.startsWith('USER_INVALID_TOKEN')) {
    status = 401;
    code = message.split(':')[0];
  } else if (message.startsWith('USER_FORBIDDEN')) {
    status = 403;
    code = message.split(':')[0];
  } else if (message.startsWith('USER_NOT_FOUND')) {
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
