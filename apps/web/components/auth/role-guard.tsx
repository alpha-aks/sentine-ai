'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';

interface RoleGuardProps {
  roles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({ roles, fallback, children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !roles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your role ({user?.role || 'Guest'}) does not have permission to view this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
