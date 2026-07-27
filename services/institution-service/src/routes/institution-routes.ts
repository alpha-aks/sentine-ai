import { Router } from 'express';
import { InstitutionController } from '../controllers/InstitutionController';
import { authenticateJwt, rateLimiter, requireRole } from '../middleware/auth-middleware';
import { extractTenantContext, tenantGuard } from '../middleware/tenant-middleware';

export function createInstitutionRouter(controller?: InstitutionController): Router {
  const router = Router();
  const instController = controller || new InstitutionController();

  // Middleware pipeline: JWT Auth -> Multi-tenant context extraction
  router.use(authenticateJwt);
  router.use(extractTenantContext);

  // Institution Root Endpoints
  router.get('/search', rateLimiter(60, 60000), instController.searchInstitutions);
  router.get('/', rateLimiter(60, 60000), instController.searchInstitutions);
  router.post('/', requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']), instController.createInstitution);
  router.get('/:institutionId', instController.getInstitution);
  router.patch(
    '/:institutionId',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.updateInstitution
  );
  router.delete(
    '/:institutionId',
    requireRole(['EXAM_ADMIN']),
    instController.deleteInstitution
  );

  // Departments
  router.post(
    '/:institutionId/departments',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.createDepartment
  );
  router.get('/:institutionId/departments', tenantGuard('institutionId'), instController.getDepartments);

  // Courses
  router.post(
    '/:institutionId/courses',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.createCourse
  );
  router.get('/:institutionId/courses', tenantGuard('institutionId'), instController.getCourses);

  // Faculty
  router.post(
    '/:institutionId/faculty',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.assignFaculty
  );
  router.get('/:institutionId/faculty', tenantGuard('institutionId'), instController.getFaculty);

  // Programs & Batches
  router.post(
    '/:institutionId/programs',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.createProgram
  );
  router.get('/:institutionId/programs', tenantGuard('institutionId'), instController.getPrograms);
  router.post(
    '/:institutionId/batches',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.createBatch
  );
  router.post(
    '/:institutionId/semesters',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.createSemester
  );

  // Calendar
  router.post(
    '/:institutionId/calendar',
    requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
    tenantGuard('institutionId'),
    instController.addCalendarEvent
  );
  router.get('/:institutionId/calendar', tenantGuard('institutionId'), instController.getCalendar);

  // Branding & Configuration
  router.get('/:institutionId/branding', instController.getBranding);
  router.patch(
    '/:institutionId/branding',
    requireRole(['EXAM_ADMIN']),
    tenantGuard('institutionId'),
    instController.updateBranding
  );
  router.get('/:institutionId/configuration', tenantGuard('institutionId'), instController.getConfiguration);
  router.patch(
    '/:institutionId/configuration',
    requireRole(['EXAM_ADMIN']),
    tenantGuard('institutionId'),
    instController.updateConfiguration
  );

  return router;
}
