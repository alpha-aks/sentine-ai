import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { siteConfig } from '@/config/site-config';
import { ApiResponse } from '@/types/api';
import { setupMockInterceptor } from '@/mocks/mock-adapter';

class ApiClient {
  private static instance: ApiClient;
  public readonly client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  private constructor() {
    this.client = axios.create({
      baseURL: siteConfig.apiEndpoints.auth, // Default base; services use service-specific paths
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    this.setupInterceptors();
    setupMockInterceptor(this.client);
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request Interceptor: Attach Access Token & Tenant ID
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem(siteConfig.storageKeys.accessToken);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          const tenantId = localStorage.getItem(siteConfig.storageKeys.tenantId) || siteConfig.defaultTenantId;
          if (tenantId && config.headers) {
            config.headers['x-institution-id'] = tenantId;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Silent Token Refresh & Global Error Handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = typeof window !== 'undefined'
              ? localStorage.getItem(siteConfig.storageKeys.refreshToken)
              : null;

            if (!refreshToken) {
              this.handleLogout();
              return Promise.reject(error);
            }

            const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
              `${siteConfig.apiEndpoints.auth}/v1/auth/refresh`,
              { refreshToken }
            );

            if (refreshResponse.data.success && refreshResponse.data.data) {
              const { accessToken, refreshToken: newRefresh } = refreshResponse.data.data;

              if (typeof window !== 'undefined') {
                localStorage.setItem(siteConfig.storageKeys.accessToken, accessToken);
                localStorage.setItem(siteConfig.storageKeys.refreshToken, newRefresh);
              }

              this.processQueue(null, accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            } else {
              this.handleLogout();
              return Promise.reject(error);
            }
          } catch (refreshErr) {
            this.processQueue(refreshErr, null);
            this.handleLogout();
            return Promise.reject(refreshErr);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private processQueue(error: unknown, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private handleLogout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(siteConfig.storageKeys.accessToken);
      localStorage.removeItem(siteConfig.storageKeys.refreshToken);
      localStorage.removeItem(siteConfig.storageKeys.user);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  private transformError(error: AxiosError): Error {
    const data = error.response?.data as ApiResponse | undefined;
    
    if (!error.response) {
      const err = new Error(`NETWORK_ERROR: Unable to connect to backend service. Please ensure the backend microservices are running.`);
      (err as any).code = 'NETWORK_ERROR';
      (err as any).status = 0;
      return err;
    }

    const message = data?.error?.message || error.message || 'An unexpected error occurred';
    const code = data?.error?.code || `HTTP_${error.response.status}`;
    const err = new Error(`${code}: ${message}`);
    (err as any).code = code;
    (err as any).status = error.response.status;
    return err;
  }
}

export const apiClient = ApiClient.getInstance().client;
