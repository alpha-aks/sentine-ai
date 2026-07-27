export const siteConfig = {
  name: 'SentinelAI',
  description: 'Autonomous Multi-Agent Exam Integrity Platform',
  version: '1.0.0',
  apiEndpoints: {
    auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4001',
    user: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4002',
    institution: process.env.NEXT_PUBLIC_INSTITUTION_SERVICE_URL || 'http://localhost:4003',
    exam: process.env.NEXT_PUBLIC_EXAM_SERVICE_URL || 'http://localhost:4004',
    question: process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL || 'http://localhost:4005',
    session: process.env.NEXT_PUBLIC_SESSION_SERVICE_URL || 'http://localhost:4006',
    submission: process.env.NEXT_PUBLIC_SUBMISSION_SERVICE_URL || 'http://localhost:4007',
    proctorMonitoring: process.env.NEXT_PUBLIC_PROCTOR_MONITORING_SERVICE_URL || 'http://localhost:4008'
  },
  defaultTenantId: process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'inst_default',
  storageKeys: {
    accessToken: 'sentinel_access_token',
    refreshToken: 'sentinel_refresh_token',
    user: 'sentinel_user',
    tenantId: 'sentinel_tenant_id',
    theme: 'sentinel_theme'
  }
};
