export interface SubmissionServiceConfig {
  port: number;
  jwtSecret: string;
  serviceName: string;
  cacheTtlSeconds: number;

  // Autosave
  autosaveIntervalMs: number;
  maxDraftBatchSize: number;

  // File Upload
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];

  // Validation
  requireAllQuestionsForManualSubmit: boolean;
  enableConflictDetection: boolean;
}

export function getSubmissionServiceConfig(): SubmissionServiceConfig {
  return {
    port: parseInt(process.env.SUBMISSION_SERVICE_PORT || '4007', 10),
    jwtSecret: process.env.JWT_SECRET || 'sentinel_ai_jwt_secret_key_production_grade_32_bytes',
    serviceName: 'sentinel-ai-submission-service',
    cacheTtlSeconds: parseInt(process.env.SUBMISSION_CACHE_TTL_SECONDS || '300', 10),

    // Autosave
    autosaveIntervalMs: parseInt(process.env.AUTOSAVE_INTERVAL_MS || '10000', 10),
    maxDraftBatchSize: parseInt(process.env.MAX_DRAFT_BATCH_SIZE || '50', 10),

    // File Upload
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '26214400', 10), // 25 MB
    allowedMimeTypes: (
      process.env.ALLOWED_MIME_TYPES ||
      'image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,text/plain,text/x-python,text/javascript'
    ).split(','),

    // Validation
    requireAllQuestionsForManualSubmit: (process.env.REQUIRE_ALL_QUESTIONS || 'false') === 'true',
    enableConflictDetection: (process.env.ENABLE_CONFLICT_DETECTION || 'true') === 'true'
  };
}
