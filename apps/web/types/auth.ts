import { UserRole } from '@sentinel-ai/types';

export type { UserRole };

export interface UserSessionProfile {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  institutionId: string;
  institutionSlug?: string;
  departmentId?: string;
  accommodations?: string[];
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  status?: string;
  createdAt?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSessionProfile;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
