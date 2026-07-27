import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { authenticateJwt, rateLimiter, requireRole } from '../middleware/auth-middleware';
import { extractTenantContext, tenantGuard } from '../middleware/tenant-middleware';

export function createSubmissionRouter(controller?: SubmissionController): Router {
  const router = Router();
  const c = controller || new SubmissionController();

  router.use(authenticateJwt);
  router.use(extractTenantContext);

  // ── Exam-level routes ──────────────────────────────────────────────────────
  router.get(
    '/exam/:examId',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.listSubmissionsByExam
  );

  // ── Session route ──────────────────────────────────────────────────────────
  router.get('/session/:sessionId', c.getSubmissionBySession);

  // ── File route ─────────────────────────────────────────────────────────────
  router.get('/files/:fileId', c.getFile);

  // ── Submission Creation ────────────────────────────────────────────────────
  router.post(
    '/',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    rateLimiter(20, 60000),
    c.startSubmission
  );

  // ── Submission Read & Status ───────────────────────────────────────────────
  router.get('/:submissionId/status', c.getSubmissionStatus);
  router.get('/:submissionId/history', c.getSubmissionHistory);
  router.get('/:submissionId', c.getSubmission);

  // ── Answers, Drafts & Restore ───────────────────────────────────────────────
  router.post(
    '/:submissionId/answers',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    rateLimiter(120, 60000),
    c.saveAnswer
  );
  router.put(
    '/:submissionId/answers/:questionId',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    rateLimiter(120, 60000),
    c.saveAnswer
  );
  router.post(
    '/:submissionId/drafts',
    requireRole(['CANDIDATE']),
    rateLimiter(300, 60000),
    c.saveDraft
  );
  router.post(
    '/:submissionId/answers/draft',
    requireRole(['CANDIDATE']),
    rateLimiter(300, 60000),
    c.saveDraft
  );
  router.post(
    '/:submissionId/autosave',
    requireRole(['CANDIDATE']),
    rateLimiter(60, 60000),
    c.batchAutosave
  );
  router.post(
    '/:submissionId/answers/batch-draft',
    requireRole(['CANDIDATE']),
    rateLimiter(60, 60000),
    c.batchAutosave
  );
  router.post(
    '/:submissionId/drafts/:questionId/restore',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    c.restoreDraft
  );
  router.post(
    '/:submissionId/answers/:questionId/restore-draft',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    c.restoreDraft
  );
  router.get(
    '/:submissionId/answers/:questionId/versions',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.getAnswerVersions
  );

  // ── Review Phase ───────────────────────────────────────────────────────────
  router.get('/:submissionId/review', c.reviewSubmission);
  router.post('/:submissionId/review', c.reviewSubmission);

  // ── File Upload ────────────────────────────────────────────────────────────
  router.post(
    '/:submissionId/files',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    rateLimiter(30, 60000),
    c.uploadFile
  );

  // ── Final Submit & Auto Submit ─────────────────────────────────────────────
  router.post(
    '/:submissionId/submit',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    c.submitFinal
  );
  router.post(
    '/:submissionId/auto-submit',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER', 'LIVE_PROCTOR']),
    c.autoSubmit
  );

  // ── Lock & Recovery ────────────────────────────────────────────────────────
  router.post(
    '/:submissionId/lock',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN']),
    tenantGuard('institutionId'),
    c.lockSubmission
  );
  router.get('/:submissionId/recovery', c.getRecoveryState);
  router.post('/:submissionId/resume', c.getRecoveryState);

  // ── Validation & Analytics ─────────────────────────────────────────────────
  router.get('/:submissionId/validate', c.validateSubmission);
  router.get(
    '/:submissionId/analytics',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.getSubmissionAnalytics
  );

  return router;
}
