import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { authenticateJwt, rateLimiter, requireRole } from '../middleware/auth-middleware';
import { extractTenantContext, tenantGuard } from '../middleware/tenant-middleware';

export function createQuestionRouter(controller?: QuestionController): Router {
  const router = Router();
  const c = controller || new QuestionController();

  // ── Global: auth + tenant extraction on every request ─────────────────────
  router.use(authenticateJwt);
  router.use(extractTenantContext);

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────
  router.post('/categories', requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']), c.createCategory);
  router.get('/categories', c.listCategories);
  router.delete('/categories/:categoryId', requireRole(['EXAM_ADMIN']), c.deleteCategory);

  // ─────────────────────────────────────────────────────────────────────────
  // TAGS
  // ─────────────────────────────────────────────────────────────────────────
  router.post('/tags', requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']), c.createTag);
  router.get('/tags', c.listTags);
  router.delete('/tags/:tagId', requireRole(['EXAM_ADMIN']), c.deleteTag);

  // ─────────────────────────────────────────────────────────────────────────
  // EXPORT TEMPLATE
  // ─────────────────────────────────────────────────────────────────────────
  router.get('/import/template', c.getExportTemplate);

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTION BANKS
  // ─────────────────────────────────────────────────────────────────────────
  router.get('/banks', c.listBanks);
  router.post('/banks', requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'COMPLIANCE_OFFICER']), c.createBank);
  router.get('/banks/:bankId', c.getBank);
  router.patch(
    '/banks/:bankId',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.updateBank
  );
  router.post(
    '/banks/:bankId/archive',
    requireRole(['EXAM_ADMIN']),
    tenantGuard('institutionId'),
    c.archiveBank
  );
  router.post(
    '/banks/:bankId/clone',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.cloneBank
  );
  router.get('/banks/:bankId/analytics', c.getBankAnalytics);

  // ── Per-bank pools ─────────────────────────────────────────────────────────
  router.get('/banks/:bankId/pools', c.listPools);

  // ── Per-bank import / export ───────────────────────────────────────────────
  router.post(
    '/banks/:bankId/import',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.importQuestions
  );
  router.get('/banks/:bankId/export', tenantGuard('institutionId'), c.exportQuestions);

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTION POOLS (stand-alone operations)
  // ─────────────────────────────────────────────────────────────────────────
  router.post('/pools', requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']), c.createPool);
  router.get('/pools/:poolId', c.getPool);
  router.patch(
    '/pools/:poolId',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.updatePool
  );
  router.delete(
    '/pools/:poolId',
    requireRole(['EXAM_ADMIN']),
    tenantGuard('institutionId'),
    c.deletePool
  );
  router.get('/pools/:poolId/validate', c.validatePool);

  // ─────────────────────────────────────────────────────────────────────────
  // RANDOMIZATION ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  router.get('/random', rateLimiter(60, 60000), c.getRandomizedQuestions);

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────
  router.get('/search', rateLimiter(60, 60000), c.searchQuestions);
  router.get('/', rateLimiter(60, 60000), c.searchQuestions);
  router.post('/', requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'COMPLIANCE_OFFICER']), c.createQuestion);

  router.get('/:questionId', c.getQuestion);
  router.patch(
    '/:questionId',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.updateQuestion
  );
  router.delete(
    '/:questionId',
    requireRole(['EXAM_ADMIN']),
    tenantGuard('institutionId'),
    c.deleteQuestion
  );

  // ── Approval Workflow ──────────────────────────────────────────────────────
  router.patch(
    '/:questionId/approval',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    c.updateApprovalStatus
  );

  // ── Version History ────────────────────────────────────────────────────────
  router.get('/:questionId/versions', c.getVersionHistory);
  router.post(
    '/:questionId/versions/restore',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.restoreVersion
  );

  // ── Attachments ────────────────────────────────────────────────────────────
  router.post(
    '/:questionId/attachments',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.addAttachment
  );
  router.delete(
    '/:questionId/attachments/:attachmentId',
    requireRole(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']),
    tenantGuard('institutionId'),
    c.deleteAttachment
  );

  // ── Analytics ──────────────────────────────────────────────────────────────
  router.post('/:questionId/attempts', rateLimiter(120, 60000), c.recordAttempt);
  router.get('/:questionId/analytics', c.getAnalytics);

  return router;
}
