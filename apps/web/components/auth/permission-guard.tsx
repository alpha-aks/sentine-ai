'use client';

import React from 'react';
import { usePermission } from '@/hooks/use-permission';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, fallback, children }: PermissionGuardProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-md">
        You do not possess the required permission ({permission}) to perform this action.
      </div>
    );
  }

  return <>{children}</>;
}
