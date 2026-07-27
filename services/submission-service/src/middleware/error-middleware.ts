import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '@sentinel-ai/types';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : String(err);
  let status = 500;
  let code = 'SUBMISSION_SERVER_ERROR';

  if (message.startsWith('SUBMISSION_NOT_FOUND')) {
    status = 404; code = 'SUBMISSION_NOT_FOUND';
  } else if (message.startsWith('SUBMISSION_INVALID_INPUT')) {
    status = 400; code = 'SUBMISSION_INVALID_INPUT';
  } else if (message.startsWith('SUBMISSION_LOCKED')) {
    status = 409; code = 'SUBMISSION_LOCKED';
  } else if (message.startsWith('SUBMISSION_ALREADY_FINALIZED')) {
    status = 409; code = 'SUBMISSION_ALREADY_FINALIZED';
  } else if (message.startsWith('SUBMISSION_VALIDATION_FAILED')) {
    status = 422; code = 'SUBMISSION_VALIDATION_FAILED';
  } else if (message.startsWith('SUBMISSION_INVALID_FILE_TYPE')) {
    status = 400; code = 'SUBMISSION_INVALID_FILE_TYPE';
  } else if (message.startsWith('SUBMISSION_FILE_TOO_LARGE')) {
    status = 413; code = 'SUBMISSION_FILE_TOO_LARGE';
  } else if (message.startsWith('SUBMISSION_VIRUS_DETECTED')) {
    status = 422; code = 'SUBMISSION_VIRUS_DETECTED';
  } else if (message.startsWith('SUBMISSION_UNAUTHORIZED')) {
    status = 401; code = 'SUBMISSION_UNAUTHORIZED';
  } else if (message.startsWith('SUBMISSION_FORBIDDEN') || message.startsWith('SUBMISSION_CROSS_TENANT')) {
    status = 403; code = 'SUBMISSION_FORBIDDEN';
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
