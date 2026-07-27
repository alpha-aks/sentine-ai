import { Router } from 'express';
import { SessionController } from '../controllers/SessionController';
import { authenticateJwt, rateLimiter, requireRole } from '../middleware/auth-middleware';
import { extractTenantContext, tenantGuard } from '../middleware/tenant-middleware';

export function createSessionRouter(controller?: SessionController): Router {
  const router = Router();
  const c = controller || new SessionController();

  // ── Global: auth + tenant extraction ──────────────────────────────────────
  router.use(authenticateJwt);
  router.use(extractTenantContext);

  // ─────────────────────────────────────────────────────────────────────────
  // EXAM-LEVEL QUERIES (must come before /:sessionId routes)
  // ─────────────────────────────────────────────────────────────────────────
  router.get(
    '/exam/:examId',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.listSessionsByExam
  );
  router.get(
    '/exam/:examId/active-count',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.getActiveSessionCount
  );
  router.get(
    '/exam/:examId/analytics',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.getExamAnalyticsSummary
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION CREATION — join exam
  // ─────────────────────────────────────────────────────────────────────────
  router.post(
    '/',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    rateLimiter(10, 60000),  // max 10 joins per minute per IP
    c.joinExam
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION READ
  // ─────────────────────────────────────────────────────────────────────────
  router.get('/:sessionId', c.getSession);

  // ─────────────────────────────────────────────────────────────────────────
  // STATE TRANSITIONS
  // ─────────────────────────────────────────────────────────────────────────
  router.post('/:sessionId/ready', requireRole(['CANDIDATE', 'EXAM_ADMIN']), c.moveToReady);
  router.post('/:sessionId/start', requireRole(['CANDIDATE', 'EXAM_ADMIN']), c.startSession);
  router.post('/:sessionId/transition', requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']), c.transitionState);

  // ─────────────────────────────────────────────────────────────────────────
  // HEARTBEAT
  // ─────────────────────────────────────────────────────────────────────────
  router.post(
    '/:sessionId/heartbeat',
    requireRole(['CANDIDATE']),
    rateLimiter(300, 60000), // very high limit for heartbeats
    c.recordHeartbeat
  );
  router.get('/:sessionId/heartbeat', c.getHeartbeatStatus);

  // ─────────────────────────────────────────────────────────────────────────
  // DEVICE REGISTRATION
  // ─────────────────────────────────────────────────────────────────────────
  router.post('/:sessionId/device', requireRole(['CANDIDATE', 'EXAM_ADMIN']), c.registerDevice);
  router.get('/:sessionId/device', c.getDeviceInfo);

  // ─────────────────────────────────────────────────────────────────────────
  // RECONNECT & RECOVERY
  // ─────────────────────────────────────────────────────────────────────────
  router.post(
    '/:sessionId/reconnect/initiate',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    rateLimiter(5, 60000),
    c.initiateReconnect
  );
  router.post(
    '/:sessionId/reconnect/complete',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    rateLimiter(5, 60000),
    c.completeReconnect
  );
  router.get('/:sessionId/recovery', c.getRecoveryState);

  // ─────────────────────────────────────────────────────────────────────────
  // PRESENCE TRACKING
  // ─────────────────────────────────────────────────────────────────────────
  router.post(
    '/:sessionId/presence',
    requireRole(['CANDIDATE']),
    rateLimiter(120, 60000),
    c.recordPresenceEvent
  );
  router.get('/:sessionId/presence', c.getPresenceSummary);

  // ─────────────────────────────────────────────────────────────────────────
  // POLICY VIOLATIONS
  // ─────────────────────────────────────────────────────────────────────────
  router.post(
    '/:sessionId/violations',
    requireRole(['CANDIDATE', 'LIVE_PROCTOR', 'EXAM_ADMIN']),
    c.reportViolation
  );
  router.get(
    '/:sessionId/violations',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.getViolations
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TIMERS
  // ─────────────────────────────────────────────────────────────────────────
  router.get('/:sessionId/timer/:type', c.getTimerState);
  router.post(
    '/:sessionId/timer/:type/pause',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN']),
    c.pauseTimer
  );
  router.post(
    '/:sessionId/timer/:type/resume',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN']),
    c.resumeTimer
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SUSPENSION & RESUME
  // ─────────────────────────────────────────────────────────────────────────
  router.post(
    '/:sessionId/suspend',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN']),
    tenantGuard('institutionId'),
    c.suspendSession
  );
  router.post(
    '/:sessionId/resume',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN']),
    tenantGuard('institutionId'),
    c.resumeSession
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT & TERMINATE
  // ─────────────────────────────────────────────────────────────────────────
  router.post(
    '/:sessionId/submit',
    requireRole(['CANDIDATE', 'EXAM_ADMIN']),
    c.submitSession
  );
  router.post(
    '/:sessionId/terminate',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    c.terminateSession
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYTICS & HISTORY
  // ─────────────────────────────────────────────────────────────────────────
  router.get(
    '/:sessionId/analytics',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.getSessionAnalytics
  );
  router.get(
    '/:sessionId/history',
    requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    c.getStateHistory
  );

  return router;
}
