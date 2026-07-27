export const API_CONFIG = {
  SERVICES: {
    AUTH: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4001',
    USER: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4002',
    INSTITUTION: process.env.NEXT_PUBLIC_INSTITUTION_SERVICE_URL || 'http://localhost:4003',
    EXAM: process.env.NEXT_PUBLIC_EXAM_SERVICE_URL || 'http://localhost:4004',
    QUESTION: process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL || 'http://localhost:4005',
    SESSION: process.env.NEXT_PUBLIC_SESSION_SERVICE_URL || 'http://localhost:4006',
    SUBMISSION: process.env.NEXT_PUBLIC_SUBMISSION_SERVICE_URL || 'http://localhost:4007'
  }
};
