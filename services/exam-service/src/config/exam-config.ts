export interface ExamServiceConfig {
  port: number;
  jwtSecret: string;
  cacheTtlSeconds: number; // default 300 (5 min)
  defaultGracePeriodMinutes: number;
  maxExamDurationMinutes: number;
  serviceName: string;
}

export function getExamServiceConfig(): ExamServiceConfig {
  return {
    port: parseInt(process.env.EXAM_SERVICE_PORT || '4004', 10),
    jwtSecret: process.env.JWT_SECRET || 'sentinel_ai_jwt_secret_key_production_grade_32_bytes',
    cacheTtlSeconds: parseInt(process.env.EXAM_CACHE_TTL_SECONDS || '300', 10),
    defaultGracePeriodMinutes: parseInt(process.env.DEFAULT_GRACE_PERIOD_MINUTES || '15', 10),
    maxExamDurationMinutes: parseInt(process.env.MAX_EXAM_DURATION_MINUTES || '480', 10),
    serviceName: 'sentinel-ai-exam-service'
  };
}
