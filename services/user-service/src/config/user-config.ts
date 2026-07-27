export interface UserServiceConfig {
  port: number;
  jwtSecret: string;
  cacheTtlSeconds: number; // default 300 (5 min)
  defaultAvatarUrl: string;
  maxSearchLimit: number;
  serviceName: string;
}

export function getUserServiceConfig(): UserServiceConfig {
  return {
    port: parseInt(process.env.USER_SERVICE_PORT || '4002', 10),
    jwtSecret: process.env.JWT_SECRET || 'sentinel_ai_jwt_secret_key_production_grade_32_bytes',
    cacheTtlSeconds: parseInt(process.env.USER_CACHE_TTL_SECONDS || '300', 10),
    defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL || 'https://assets.sentinelai.io/avatars/default.png',
    maxSearchLimit: parseInt(process.env.MAX_SEARCH_LIMIT || '100', 10),
    serviceName: 'sentinel-ai-user-service'
  };
}
