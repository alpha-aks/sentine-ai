import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { useAuthStore } from '../../store/auth-store';
import { UserSessionProfile } from '../../types/auth';

describe('useAuthStore State Management', () => {
  const mockUser: UserSessionProfile = {
    userId: 'user_123',
    email: 'test@sentinel.ai',
    fullName: 'Test User',
    role: 'CANDIDATE',
    institutionId: 'inst_default',
    institutionSlug: 'default',
    emailVerified: true,
    mfaEnabled: false,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should initialize with default unauthenticated state', () => {
    const state = useAuthStore.getState();
    assert.strictEqual(state.isAuthenticated, false);
    assert.strictEqual(state.user, null);
    assert.strictEqual(state.accessToken, null);
  });

  it('should update state on setAuth', () => {
    useAuthStore.getState().setAuth(mockUser, 'access_token_123', 'refresh_token_123');

    const state = useAuthStore.getState();
    assert.strictEqual(state.isAuthenticated, true);
    assert.strictEqual(state.user?.email, 'test@sentinel.ai');
    assert.strictEqual(state.accessToken, 'access_token_123');
    assert.strictEqual(state.refreshToken, 'refresh_token_123');
  });

  it('should clear state on logout', () => {
    useAuthStore.getState().setAuth(mockUser, 'token123', 'refresh123');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    assert.strictEqual(state.isAuthenticated, false);
    assert.strictEqual(state.user, null);
    assert.strictEqual(state.accessToken, null);
  });
});
