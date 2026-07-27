import { Router } from 'express';
import { ExamController } from '../controllers/ExamController';
import { authenticateJwt, rateLimiter, requireRole } from '../middleware/auth-middleware';
import { extractTenantContext, tenantGuard } from '../middleware/tenant-middleware';

export function createExamRouter(controller?: ExamController): Router {
  const router = Router();
  const examController = controller || new ExamController();

  // Authentication & Multi-tenant extraction middleware
  router.use(authenticateJwt);
  router.use(extractTenantContext);

  // Exam Root Endpoints
  router.get('/search', rateLimiter(60, 60000), examController.searchExams);
  router.get('/', rateLimiter(60, 60000), examController.searchExams);
  router.post(
    '/',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'COMPLIANCE_OFFICER']),
    examController.createExam
  );
  router.get('/:examId', examController.getExam);
  router.patch(
    '/:examId',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.updateExam
  );
  router.delete(
    '/:examId',
    requireRole(['EXAM_ADMIN']),
    tenantGuard('institutionId'),
    examController.deleteExam
  );

  // Lifecycle Transitions
  router.post(
    '/:examId/schedule',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.scheduleExam
  );
  router.post(
    '/:examId/publish',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    examController.publishExam
  );
  router.post(
    '/:examId/archive',
    requireRole(['EXAM_ADMIN']),
    tenantGuard('institutionId'),
    examController.archiveExam
  );
  router.post(
    '/:examId/activate',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.activateExam
  );
  router.post(
    '/:examId/deactivate',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.deactivateExam
  );
  router.post(
    '/:examId/cancel',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    examController.cancelExam
  );
  router.post(
    '/:examId/duplicate',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.duplicateExam
  );

  // Rules, AI Policy & Sections
  router.patch(
    '/:examId/rules',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.updateRules
  );
  router.patch(
    '/:examId/policy',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    examController.updatePolicy
  );
  router.put(
    '/:examId/sections',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.updateSections
  );

  // Candidate Eligibility
  router.patch(
    '/:examId/eligibility',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    examController.updateEligibility
  );
  router.get('/:examId/eligibility/:candidateId', examController.checkEligibility);

  // Templates
  router.post(
    '/templates',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    examController.createTemplate
  );

  return router;
}
