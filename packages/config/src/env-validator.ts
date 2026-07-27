import { AppConfig, NodeEnv } from './types';
import { EnvSecretsProvider, ISecretsProvider } from './secrets-provider';
import { FeatureFlagsManager } from './feature-flags';

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Environment validation failed:\n - ${issues.join('\n - ')}`);
    this.name = 'EnvValidationError';
  }
}

export function validateAndLoadConfig(
  secretsProvider: ISecretsProvider = new EnvSecretsProvider()
): AppConfig {
  const issues: string[] = [];

  const rawEnv = process.env.NODE_ENV || 'development';
  const allowedEnvs: NodeEnv[] = ['development', 'test', 'staging', 'production'];

  if (!allowedEnvs.includes(rawEnv as NodeEnv)) {
    issues.push(`NODE_ENV must be one of [${allowedEnvs.join(', ')}], got: "${rawEnv}"`);
  }

  const env = (allowedEnvs.includes(rawEnv as NodeEnv) ? rawEnv : 'development') as NodeEnv;
  const isDevelopment = env === 'development';
  const isProduction = env === 'production';

  const port = parseInt(process.env.PORT || '4000', 10);
  if (isNaN(port) || port < 1024 || port > 65535) {
    issues.push(
      `PORT must be a valid port number between 1024 and 65535, got: "${process.env.PORT}"`
    );
  }

  const host = process.env.HOST || '0.0.0.0';
  const corsOrigins = (
    process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002'
  ).split(',');

  const dbUrl =
    process.env.DATABASE_URL ||
    (isDevelopment ? 'postgresql://sentinel:sentinel@localhost:5432/sentinel_db' : '');
  if (!dbUrl && isProduction) {
    issues.push('DATABASE_URL is required in production environment');
  }

  const redisUrl = process.env.REDIS_URL || (isDevelopment ? 'redis://localhost:6379' : '');
  if (!redisUrl && isProduction) {
    issues.push('REDIS_URL is required in production environment');
  }

  let jwtSecret = '';
  try {
    jwtSecret = secretsProvider.getSecretSync(
      'JWT_SECRET',
      isDevelopment ? 'sentinel_dev_secret_key_change_in_prod_12345' : undefined
    );
  } catch {
    if (isProduction) {
      issues.push('JWT_SECRET secret key is missing in production');
    } else {
      jwtSecret = 'sentinel_dev_secret_key_change_in_prod_12345';
    }
  }

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }

  const featureFlagsManager = new FeatureFlagsManager(env);

  return {
    server: {
      env,
      isDevelopment,
      isProduction,
      port,
      host,
      corsOrigins
    },
    database: {
      url: dbUrl,
      redisUrl,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10)
    },
    security: {
      jwtSecret,
      jwtExpiresInSeconds: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '86400', 10),
      mtlsEnabled: process.env.MTLS_ENABLED === 'true',
      auditHashKey: process.env.AUDIT_HASH_KEY || 'sha256_key_sentinel'
    },
    features: featureFlagsManager.getAllFlags()
  };
}
