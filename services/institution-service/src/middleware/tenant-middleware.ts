import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth-middleware';

export interface TenantRequest extends AuthenticatedRequest {
  institutionId?: string;
}

export function extractTenantContext(req: TenantRequest, _res: Response, next: NextFunction): void {
  // Extract tenant context from X-Institution-Id header or JWT payload
  const headerTenant = req.headers['x-institution-id'] as string;
  const jwtTenant = req.user?.institutionId;

  req.institutionId = headerTenant || jwtTenant || undefined;
  next();
}

export function tenantGuard(paramName: string = 'institutionId') {
  return (req: TenantRequest, res: Response, next: NextFunction): void => {
    const targetInstitutionId = req.params[paramName] || req.body[paramName] || req.query[paramName];
    const actorTenantId = req.institutionId;
    const actorRole = req.user?.role;

    // Platform global admins (EXAM_ADMIN, COMPLIANCE_OFFICER) can cross-tenant manage
    if (actorRole === 'EXAM_ADMIN' || actorRole === 'COMPLIANCE_OFFICER') {
      next();
      return;
    }

    if (!actorTenantId || (targetInstitutionId && targetInstitutionId !== actorTenantId)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSTITUTION_CROSS_TENANT_FORBIDDEN',
          message: 'Access denied: Cannot access or mutate resources outside your assigned institution',
          details: []
        },
        meta: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        }
      });
      return;
    }

    next();
  };
}
