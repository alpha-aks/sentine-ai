'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';

interface TenantGuardProps {
  tenantId: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function TenantGuard({ tenantId, fallback, children }: TenantGuardProps) {
  const user = useAuthStore((state) => state.user);

  const userTenant = user?.institutionId || user?.institutionSlug;
  const isSuperAdmin = user?.role === 'COMPLIANCE_OFFICER' || user?.role === 'EXAM_ADMIN';

  if (!isSuperAdmin && userTenant !== tenantId) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-md">
        This resource belongs to another institution. Access restricted.
      </div>
    );
  }

  return <>{children}</>;
}
