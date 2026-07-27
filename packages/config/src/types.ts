export type NodeEnv = 'development' | 'test' | 'staging' | 'production';

export interface ServerConfig {
  env: NodeEnv;
  isDevelopment: boolean;
  isProduction: boolean;
  port: number;
  host: string;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  url: string;
  redisUrl: string;
  maxConnections: number;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  mtlsEnabled: boolean;
  auditHashKey: string;
}

export interface FeatureFlags {
  enableVisionGuard: boolean;
  enableBehavioralAnalyst: boolean;
  enableCollusionDetection: boolean;
  enableRiskPrediction: boolean;
  enableAuditHashChain: boolean;
  enableCheatingSimulator: boolean;
}

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  features: FeatureFlags;
}
