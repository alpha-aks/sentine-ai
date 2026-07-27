import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  requestId?: string;
  correlationId?: string;
  user?: any;
  tenantId?: string;
}

export function requestIdMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader('x-request-id', requestId);
  res.setHeader('x-correlation-id', correlationId);

  next();
}
