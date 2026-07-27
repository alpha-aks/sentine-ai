'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { authService } from '@/services/auth.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializeAuth, setUser, logout } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Automatic Idle Logout after 15 minutes of inactivity
  useIdleTimeout(() => {
    if (isAuthenticated) {
      console.warn('User idle timeout reached. Logging out.');
      logout();
    }
  }, 15 * 60 * 1000);

  useEffect(() => {
    // Silent background token & profile re-validation
    if (isAuthenticated) {
      authService
        .me()
        .then((profile) => setUser(profile))
        .catch(() => {
          // If token re-validation fails (e.g. stale/invalid token), logout cleanly
          logout();
        });
    }
  }, [isAuthenticated, setUser, logout]);

  return <>{children}</>;
}
