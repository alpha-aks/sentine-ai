import { apiClient } from '@/lib/api-client';
import { siteConfig } from '@/config/site-config';
import { ApiResponse } from '@/types/api';
import { LoginResponseData, RefreshTokenResponseData, UserSessionProfile } from '@/types/auth';
import { LoginFormData, RegisterFormData } from '@/utils/validators';

export const authService = {
  async login(credentials: LoginFormData): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      `${siteConfig.apiEndpoints.auth}/v1/auth/login`,
      credentials
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Login failed');
    }
    return response.data.data;
  },

  async register(data: RegisterFormData): Promise<UserSessionProfile> {
    const response = await apiClient.post<ApiResponse<UserSessionProfile>>(
      `${siteConfig.apiEndpoints.auth}/v1/auth/register`,
      {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        institutionSlug: data.institutionId,
        role: data.role
      }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Registration failed');
    }
    return response.data.data;
  },

  async refresh(refreshToken: string): Promise<RefreshTokenResponseData> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponseData>>(
      `${siteConfig.apiEndpoints.auth}/v1/auth/refresh`,
      { refreshToken }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Token refresh failed');
    }
    return response.data.data;
  },

  async me(): Promise<UserSessionProfile> {
    const response = await apiClient.get<ApiResponse<UserSessionProfile>>(
      `${siteConfig.apiEndpoints.auth}/v1/auth/me`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch current user profile');
    }
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${siteConfig.apiEndpoints.auth}/v1/auth/password/forgot`,
      { email }
    );
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Password reset request failed');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${siteConfig.apiEndpoints.auth}/v1/auth/password/reset`,
      { token, newPassword }
    );
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Password reset failed');
    }
  },

  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${siteConfig.apiEndpoints.auth}/v1/auth/email/verify`,
      { token }
    );
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Email verification failed');
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${siteConfig.apiEndpoints.auth}/v1/auth/logout`);
    } catch {
      // Ignore network errors on logout
    }
  }
};
