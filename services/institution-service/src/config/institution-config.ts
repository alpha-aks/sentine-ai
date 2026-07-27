export interface InstitutionServiceConfig {
  port: number;
  jwtSecret: string;
  cacheTtlSeconds: number; // default 600 (10 min)
  defaultLogoUrl: string;
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
  serviceName: string;
}

export function getInstitutionServiceConfig(): InstitutionServiceConfig {
  return {
    port: parseInt(process.env.INSTITUTION_SERVICE_PORT || '4003', 10),
    jwtSecret: process.env.JWT_SECRET || 'sentinel_ai_jwt_secret_key_production_grade_32_bytes',
    cacheTtlSeconds: parseInt(process.env.INSTITUTION_CACHE_TTL_SECONDS || '600', 10),
    defaultLogoUrl: process.env.DEFAULT_INSTITUTION_LOGO || 'https://assets.sentinelai.io/branding/default-logo.png',
    defaultPrimaryColor: process.env.DEFAULT_PRIMARY_COLOR || '#1E40AF',
    defaultSecondaryColor: process.env.DEFAULT_SECONDARY_COLOR || '#3B82F6',
    serviceName: 'sentinel-ai-institution-service'
  };
}
