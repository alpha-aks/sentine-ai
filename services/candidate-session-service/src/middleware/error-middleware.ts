import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '@sentinel-ai/types';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : String(err);
  let status = 500;
  let code = 'SESSION_SERVER_ERROR';

  if (message.startsWith('SESSION_NOT_FOUND')) {
    status = 404; code = 'SESSION_NOT_FOUND';
  } else if (message.startsWith('SESSION_ALREADY_EXISTS')) {
    status = 409; code = 'SESSION_ALREADY_EXISTS';
  } else if (message.startsWith('SESSION_INVALID_INPUT')) {
    status = 400; code = 'SESSION_INVALID_INPUT';
  } else if (message.startsWith('SESSION_INVALID_TRANSITION')) {
    status = 409; code = 'SESSION_INVALID_TRANSITION';
  } else if (message.startsWith('SESSION_INVALID_STATE')) {
    status = 409; code = 'SESSION_INVALID_STATE';
  } else if (message.startsWith('SESSION_ALREADY_TERMINAL')) {
    status = 409; code = 'SESSION_ALREADY_TERMINAL';
  } else if (message.startsWith('SESSION_TERMINATED')) {
    status = 410; code = 'SESSION_TERMINATED';
  } else if (message.startsWith('SESSION_INVALID_TOKEN')) {
    status = 400; code = 'SESSION_INVALID_TOKEN';
  } else if (message.startsWith('SESSION_TOKEN_EXPIRED')) {
    status = 401; code = 'SESSION_TOKEN_EXPIRED';
  } else if (message.startsWith('SESSION_TOKEN_REPLAYED')) {
    status = 409; code = 'SESSION_TOKEN_REPLAYED';
  } else if (message.startsWith('SESSION_TOKEN_NOT_FOUND')) {
    status = 404; code = 'SESSION_TOKEN_NOT_FOUND';
  } else if (message.startsWith('SESSION_RECONNECT_LIMIT_EXCEEDED')) {
    status = 429; code = 'SESSION_RECONNECT_LIMIT_EXCEEDED';
  } else if (message.startsWith('SESSION_UNAUTHORIZED')) {
    status = 401; code = 'SESSION_UNAUTHORIZED';
  } else if (message.startsWith('SESSION_FORBIDDEN') || message.startsWith('SESSION_CROSS_TENANT')) {
    status = 403; code = 'SESSION_FORBIDDEN';
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
