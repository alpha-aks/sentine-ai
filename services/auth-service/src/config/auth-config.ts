export interface AuthServiceConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresInSeconds: number; // default 900 (15 min)
  refreshTokenSecret: string;
  refreshTokenExpiresInDays: number; // default 7 days
  maxFailedLoginAttempts: number; // default 5
  lockoutDurationMinutes: number; // default 15
  emailVerificationTokenTtlHours: number; // default 24
  passwordResetTokenTtlHours: number; // default 1
  pbkdf2Iterations: number; // default 100000
  serviceName: string;
  corsOrigin: string;
}

export function getAuthConfig(): AuthServiceConfig {
  return {
    port: parseInt(process.env.AUTH_SERVICE_PORT || '4001', 10),
    jwtSecret: process.env.JWT_SECRET || 'sentinel_ai_jwt_secret_key_production_grade_32_bytes',
    jwtExpiresInSeconds: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '900', 10),
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'sentinel_ai_refresh_token_secret_key_production_grade',
    refreshTokenExpiresInDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '7', 10),
    maxFailedLoginAttempts: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5', 10),
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10),
    emailVerificationTokenTtlHours: parseInt(process.env.EMAIL_VERIFICATION_TTL_HOURS || '24', 10),
    passwordResetTokenTtlHours: parseInt(process.env.PASSWORD_RESET_TTL_HOURS || '1', 10),
    pbkdf2Iterations: parseInt(process.env.PBKDF2_ITERATIONS || '100000', 10),
    serviceName: 'sentinel-ai-auth-service',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  };
}
