import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { siteConfig } from '@/config/site-config';
import { UserSessionProfile } from '@/types/auth';

function syncCookies(accessToken: string | null) {
  if (typeof window === 'undefined') return;
  if (accessToken) {
    document.cookie = `sentinel_access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
  } else {
    document.cookie = `sentinel_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

interface AuthState {
  user: UserSessionProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: UserSessionProfile, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserSessionProfile) => void;
  initializeAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: true,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(siteConfig.storageKeys.accessToken, accessToken);
          localStorage.setItem(siteConfig.storageKeys.refreshToken, refreshToken);
          localStorage.setItem(siteConfig.storageKeys.user, JSON.stringify(user));
          if (user.institutionId) {
            localStorage.setItem(siteConfig.storageKeys.tenantId, user.institutionId);
          }
          syncCookies(accessToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true, isInitializing: false });
      },

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(siteConfig.storageKeys.accessToken, accessToken);
          localStorage.setItem(siteConfig.storageKeys.refreshToken, refreshToken);
          syncCookies(accessToken);
        }
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(siteConfig.storageKeys.user, JSON.stringify(user));
        }
        set({ user });
      },

      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem(siteConfig.storageKeys.accessToken);
          const refreshToken = localStorage.getItem(siteConfig.storageKeys.refreshToken);
          const userJson = localStorage.getItem(siteConfig.storageKeys.user);

          if (accessToken && userJson) {
            try {
              const user = JSON.parse(userJson);
              syncCookies(accessToken);
              set({ user, accessToken, refreshToken, isAuthenticated: true, isInitializing: false });
              return;
            } catch {
              // Failed to parse JSON user
            }
          }
        }
        syncCookies(null);
        set({ isInitializing: false });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(siteConfig.storageKeys.accessToken);
          localStorage.removeItem(siteConfig.storageKeys.refreshToken);
          localStorage.removeItem(siteConfig.storageKeys.user);
          syncCookies(null);
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isInitializing: false });
      }
    }),
    {
      name: 'sentinel_auth_state',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
