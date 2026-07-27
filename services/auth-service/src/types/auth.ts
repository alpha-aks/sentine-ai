import { UserRole } from '@sentinel-ai/types';

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';

export interface UserEntity {
  userId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  institutionId: string;
  institutionSlug: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  failedLoginAttempts: number;
  lockoutUntil: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SessionEntity {
  sessionId: string;
  userId: string;
  deviceIp: string;
  userAgent: string;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
}

export interface RefreshTokenEntity {
  tokenId: string;
  sessionId: string;
  userId: string;
  tokenHash: string;
  isRevoked: boolean;
  replacedByTokenId: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface VerificationTokenEntity {
  tokenId: string;
  userId: string;
  token: string;
  type: 'EMAIL_VERIFICATION';
  isUsed: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface PasswordResetTokenEntity {
  tokenId: string;
  userId: string;
  token: string;
  isUsed: boolean;
  createdAt: string;
  expiresAt: string;
}

// Request DTOs
export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName: string;
  institutionSlug: string;
  role?: UserRole;
}

export interface LoginRequestDto {
  email: string;
  password: string;
  institution_slug?: string;
  deviceIp?: string;
  userAgent?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface VerifyEmailRequestDto {
  token: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyMfaRequestDto {
  userId: string;
  code: string;
}

// Response Payloads
export interface UserProfilePayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  institutionId: string;
  institutionSlug: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  status: UserStatus;
  createdAt: string;
}

export interface AuthSuccessPayload {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  mfaRequired: boolean;
  user: UserProfilePayload;
}
