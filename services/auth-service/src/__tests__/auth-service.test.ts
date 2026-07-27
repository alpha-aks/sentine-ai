import assert from 'assert';
import { test, describe, beforeEach } from 'node:test';
import { AuthRepository } from '../db/AuthRepository';
import { AuthService } from '../services/AuthService';
import { getAuthConfig } from '../config/auth-config';

describe('Authentication Service Suite', () => {
  let repository: AuthRepository;
  let service: AuthService;

  beforeEach(() => {
    repository = new AuthRepository();
    const config = getAuthConfig();
    config.maxFailedLoginAttempts = 3;
    service = new AuthService(repository, undefined, config);
  });

  test('1. User Registration Flow', async () => {
    const user = await service.register({
      email: 'student.test@university.edu',
      password: 'SecurePassword123!',
      fullName: 'Test Student',
      institutionSlug: 'mit-univ',
      role: 'CANDIDATE'
    });

    assert.strictEqual(user.email, 'student.test@university.edu');
    assert.strictEqual(user.status, 'PENDING_VERIFICATION');
    assert.strictEqual(user.emailVerified, false);
  });

  test('2. Weak Password Rejection', async () => {
    await assert.rejects(
      async () => {
        await service.register({
          email: 'weak@university.edu',
          password: '123',
          fullName: 'Weak Student',
          institutionSlug: 'mit-univ'
        });
      },
      (err: any) => err.message.includes('AUTH_WEAK_PASSWORD')
    );
  });

  test('3. Email Verification Flow', async () => {
    const registered = await service.register({
      email: 'verify.test@university.edu',
      password: 'SecurePassword123!',
      fullName: 'Verify Student',
      institutionSlug: 'mit-univ'
    });

    // Extract created verification token
    const repo = service.getRepository();
    const userEntity = await repo.findUserByEmail('verify.test@university.edu');
    assert.ok(userEntity);

    // Verify email using token
    const tokenEntity = await repo.findVerificationToken((repo as any).verificationTokens.keys().next().value);
    assert.ok(tokenEntity);

    const verifiedUser = await service.verifyEmail({ token: tokenEntity.token });
    assert.strictEqual(verifiedUser.emailVerified, true);
    assert.strictEqual(verifiedUser.status, 'ACTIVE');
  });

  test('4. Login & JWT Token Generation', async () => {
    await service.register({
      email: 'login.test@university.edu',
      password: 'SecurePassword123!',
      fullName: 'Login Student',
      institutionSlug: 'mit-univ'
    });

    const repo = service.getRepository();
    const userEntity = await repo.findUserByEmail('login.test@university.edu');
    await repo.updateUser(userEntity!.userId, { emailVerified: true, status: 'ACTIVE' });

    const authPayload = await service.login({
      email: 'login.test@university.edu',
      password: 'SecurePassword123!'
    });

    assert.ok(authPayload.accessToken);
    assert.ok(authPayload.refreshToken);
    assert.strictEqual(authPayload.tokenType, 'Bearer');
    assert.strictEqual(authPayload.user.email, 'login.test@university.edu');
  });

  test('5. Account Lockout Protection after 3 Failed Attempts', async () => {
    await service.register({
      email: 'lockout.test@university.edu',
      password: 'SecurePassword123!',
      fullName: 'Lockout Student',
      institutionSlug: 'mit-univ'
    });

    const repo = service.getRepository();
    const userEntity = await repo.findUserByEmail('lockout.test@university.edu');
    await repo.updateUser(userEntity!.userId, { emailVerified: true, status: 'ACTIVE' });

    // 3 Failed login attempts
    for (let i = 0; i < 3; i++) {
      try {
        await service.login({
          email: 'lockout.test@university.edu',
          password: 'WrongPassword123!'
        });
      } catch {
        // Expected failure
      }
    }

    // 4th attempt should throw ACCOUNT_LOCKED
    await assert.rejects(
      async () => {
        await service.login({
          email: 'lockout.test@university.edu',
          password: 'SecurePassword123!'
        });
      },
      (err: any) => err.message.includes('AUTH_ACCOUNT_LOCKED')
    );
  });

  test('6. Refresh Token Exchange & Rotation', async () => {
    await service.register({
      email: 'refresh.test@university.edu',
      password: 'SecurePassword123!',
      fullName: 'Refresh Student',
      institutionSlug: 'mit-univ'
    });

    const repo = service.getRepository();
    const userEntity = await repo.findUserByEmail('refresh.test@university.edu');
    await repo.updateUser(userEntity!.userId, { emailVerified: true, status: 'ACTIVE' });

    const auth1 = await service.login({
      email: 'refresh.test@university.edu',
      password: 'SecurePassword123!'
    });

    // Exchange refresh token for new pair
    const auth2 = await service.refreshToken(auth1.refreshToken);
    assert.ok(auth2.accessToken);
    assert.notStrictEqual(auth1.refreshToken, auth2.refreshToken);

    // Old refresh token reuse should trigger SECURITY CASCADE REVOCATION
    await assert.rejects(
      async () => {
        await service.refreshToken(auth1.refreshToken);
      },
      (err: any) => err.message.includes('AUTH_TOKEN_REVOKED')
    );
  });

  test('7. Password Reset & Session Revocation', async () => {
    await service.register({
      email: 'reset.test@university.edu',
      password: 'SecurePassword123!',
      fullName: 'Reset Student',
      institutionSlug: 'mit-univ'
    });

    const repo = service.getRepository();
    const userEntity = await repo.findUserByEmail('reset.test@university.edu');
    await repo.updateUser(userEntity!.userId, { emailVerified: true, status: 'ACTIVE' });

    // Initiate forgot password
    await service.forgotPassword({ email: 'reset.test@university.edu' });

    const resetTokenEntity = (repo as any).passwordResetTokens.values().next().value;
    assert.ok(resetTokenEntity);

    // Reset password
    const result = await service.resetPassword({
      token: resetTokenEntity.token,
      newPassword: 'BrandNewPassword456!'
    });

    assert.ok(result.message.includes('successfully'));

    // Login with new password
    const newAuth = await service.login({
      email: 'reset.test@university.edu',
      password: 'BrandNewPassword456!'
    });
    assert.ok(newAuth.accessToken);
  });

  test('8. Multi-device Session Management', async () => {
    await service.register({
      email: 'multidevice.test@university.edu',
      password: 'SecurePassword123!',
      fullName: 'Multi Device Student',
      institutionSlug: 'mit-univ'
    });

    const repo = service.getRepository();
    const userEntity = await repo.findUserByEmail('multidevice.test@university.edu');
    await repo.updateUser(userEntity!.userId, { emailVerified: true, status: 'ACTIVE' });

    // Session 1 (Laptop)
    const session1 = await service.login({
      email: 'multidevice.test@university.edu',
      password: 'SecurePassword123!',
      userAgent: 'Chrome / MacOS'
    });

    // Session 2 (Mobile)
    await service.login({
      email: 'multidevice.test@university.edu',
      password: 'SecurePassword123!',
      userAgent: 'Safari / iOS'
    });

    const activeSessions = await service.getUserSessions(userEntity!.userId);
    assert.strictEqual(activeSessions.length, 2);

    // Revoke Session 1
    const sessionId1 = (session1.user as any).userId ? activeSessions[0].sessionId : activeSessions[0].sessionId;
    await service.revokeSession(userEntity!.userId, sessionId1);

    const remainingSessions = await service.getUserSessions(userEntity!.userId);
    assert.strictEqual(remainingSessions.length, 1);
  });
});
