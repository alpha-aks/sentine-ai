'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { LoadingScreen } from './loading-screen';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing } = useAuthStore();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isInitializing, redirectUrl, router]);

  if (isInitializing) {
    return <LoadingScreen text="Loading SentinelAI..." />;
  }

  if (isAuthenticated) {
    return <LoadingScreen text="Redirecting to Dashboard..." />;
  }

  return <>{children}</>;
}
