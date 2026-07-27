export interface QuestionServiceConfig {
  port: number;
  jwtSecret: string;
  cacheTtlSeconds: number; // default 300 (5 min)
  maxImportBatchSize: number;
  serviceName: string;
}

export function getQuestionServiceConfig(): QuestionServiceConfig {
  return {
    port: parseInt(process.env.QUESTION_SERVICE_PORT || '4005', 10),
    jwtSecret: process.env.JWT_SECRET || 'sentinel_ai_jwt_secret_key_production_grade_32_bytes',
    cacheTtlSeconds: parseInt(process.env.QUESTION_CACHE_TTL_SECONDS || '300', 10),
    maxImportBatchSize: parseInt(process.env.MAX_IMPORT_BATCH_SIZE || '500', 10),
    serviceName: 'sentinel-ai-question-service'
  };
}
