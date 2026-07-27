import {
  PasswordResetTokenEntity,
  RefreshTokenEntity,
  SessionEntity,
  UserEntity,
  VerificationTokenEntity
} from '../types/auth';

export class AuthRepository {
  private users: Map<string, UserEntity> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId
  private sessions: Map<string, SessionEntity> = new Map();
  private refreshTokens: Map<string, RefreshTokenEntity> = new Map(); // tokenId -> Entity
  private refreshTokensByHash: Map<string, string> = new Map(); // tokenHash -> tokenId
  private verificationTokens: Map<string, VerificationTokenEntity> = new Map(); // token -> Entity
  private passwordResetTokens: Map<string, PasswordResetTokenEntity> = new Map(); // token -> Entity

  // --- User Repository Methods ---
  public async createUser(user: UserEntity): Promise<UserEntity> {
    const emailKey = user.email.toLowerCase();
    if (this.usersByEmail.has(emailKey)) {
      throw new Error(`User with email "${user.email}" already exists`);
    }
    this.users.set(user.userId, { ...user });
    this.usersByEmail.set(emailKey, user.userId);
    return { ...user };
  }

  public async findUserById(userId: string): Promise<UserEntity | null> {
    const user = this.users.get(userId);
    return user ? { ...user } : null;
  }

  public async findUserByEmail(email: string): Promise<UserEntity | null> {
    const userId = this.usersByEmail.get(email.toLowerCase());
    if (!userId) return null;
    return this.findUserById(userId);
  }

  public async updateUser(userId: string, updates: Partial<UserEntity>): Promise<UserEntity> {
    const existing = this.users.get(userId);
    if (!existing) {
      throw new Error(`User not found: ${userId}`);
    }

    const updated: UserEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.email && updates.email.toLowerCase() !== existing.email.toLowerCase()) {
      this.usersByEmail.delete(existing.email.toLowerCase());
      this.usersByEmail.set(updates.email.toLowerCase(), userId);
    }

    this.users.set(userId, updated);
    return { ...updated };
  }

  public async updateLockoutState(
    userId: string,
    failedAttempts: number,
    lockoutUntil: string | null,
    status?: UserEntity['status']
  ): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;
    user.failedLoginAttempts = failedAttempts;
    user.lockoutUntil = lockoutUntil;
    if (status) user.status = status;
    user.updatedAt = new Date().toISOString();
  }

  // --- Session Repository Methods ---
  public async createSession(session: SessionEntity): Promise<SessionEntity> {
    this.sessions.set(session.sessionId, { ...session });
    return { ...session };
  }

  public async findSessionById(sessionId: string): Promise<SessionEntity | null> {
    const session = this.sessions.get(sessionId);
    return session ? { ...session } : null;
  }

  public async getUserSessions(userId: string): Promise<SessionEntity[]> {
    const results: SessionEntity[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.isActive) {
        results.push({ ...session });
      }
    }
    return results;
  }

  public async updateSessionActivity(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActiveAt = new Date().toISOString();
    }
  }

  public async revokeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  }

  public async revokeAllUserSessions(userId: string): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        session.isActive = false;
      }
    }
  }

  // --- Refresh Token Repository Methods ---
  public async createRefreshToken(token: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    this.refreshTokens.set(token.tokenId, { ...token });
    this.refreshTokensByHash.set(token.tokenHash, token.tokenId);
    return { ...token };
  }

  public async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const tokenId = this.refreshTokensByHash.get(tokenHash);
    if (!tokenId) return null;
    const token = this.refreshTokens.get(tokenId);
    return token ? { ...token } : null;
  }

  public async revokeRefreshToken(tokenId: string, replacedByTokenId?: string): Promise<void> {
    const token = this.refreshTokens.get(tokenId);
    if (token) {
      token.isRevoked = true;
      if (replacedByTokenId) {
        token.replacedByTokenId = replacedByTokenId;
      }
    }
  }

  public async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    for (const token of this.refreshTokens.values()) {
      if (token.userId === userId) {
        token.isRevoked = true;
      }
    }
  }

  // --- Verification Token Repository Methods ---
  public async createVerificationToken(entity: VerificationTokenEntity): Promise<VerificationTokenEntity> {
    this.verificationTokens.set(entity.token, { ...entity });
    return { ...entity };
  }

  public async findVerificationToken(token: string): Promise<VerificationTokenEntity | null> {
    const entity = this.verificationTokens.get(token);
    return entity ? { ...entity } : null;
  }

  public async markVerificationTokenUsed(token: string): Promise<void> {
    const entity = this.verificationTokens.get(token);
    if (entity) {
      entity.isUsed = true;
    }
  }

  // --- Password Reset Token Repository Methods ---
  public async createPasswordResetToken(entity: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity> {
    this.passwordResetTokens.set(entity.token, { ...entity });
    return { ...entity };
  }

  public async findPasswordResetToken(token: string): Promise<PasswordResetTokenEntity | null> {
    const entity = this.passwordResetTokens.get(token);
    return entity ? { ...entity } : null;
  }

  public async markPasswordResetTokenUsed(token: string): Promise<void> {
    const entity = this.passwordResetTokens.get(token);
    if (entity) {
      entity.isUsed = true;
    }
  }

  public clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.sessions.clear();
    this.refreshTokens.clear();
    this.refreshTokensByHash.clear();
    this.verificationTokens.clear();
    this.passwordResetTokens.clear();
  }
}
