import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authService } from '../../services/auth.service';

describe('AuthService Suite', () => {
  it('should define all authentication API endpoints', () => {
    assert.ok(authService.login);
    assert.ok(authService.register);
    assert.ok(authService.refresh);
    assert.ok(authService.me);
    assert.ok(authService.forgotPassword);
    assert.ok(authService.resetPassword);
    assert.ok(authService.verifyEmail);
    assert.ok(authService.logout);
  });
});
