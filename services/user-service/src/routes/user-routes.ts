import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJwt, rateLimiter, requireRole } from '../middleware/auth-middleware';

export function createUserRouter(controller?: UserController): Router {
  const router = Router();
  const userController = controller || new UserController();

  // All endpoints require JWT authentication
  router.use(authenticateJwt);

  // Profile Endpoints
  router.get('/me', userController.getCurrentUser);
  router.get('/search', rateLimiter(60, 60000), userController.searchUsers);
  router.get('/', rateLimiter(60, 60000), userController.searchUsers);
  router.post('/', requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']), userController.createUser);
  router.get('/:userId', userController.getUserById);
  router.patch('/:userId', userController.updateUser);
  router.delete('/:userId', requireRole(['EXAM_ADMIN']), userController.deleteUser);

  // Preference Endpoints
  router.get('/:userId/preferences', userController.getPreferences);
  router.patch('/:userId/preferences', userController.updatePreferences);

  // Role & Permission Management
  router.post('/:userId/roles', requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']), userController.assignRole);
  router.post('/:userId/permissions', requireRole(['EXAM_ADMIN']), userController.assignPermissionOverride);
  router.get('/:userId/permissions', userController.getEffectivePermissions);

  // Account Status & Institution Membership
  router.patch('/:userId/status', requireRole(['EXAM_ADMIN', 'COMPLIANCE_OFFICER']), userController.updateStatus);
  router.post('/:userId/institutions', requireRole(['EXAM_ADMIN']), userController.addInstitutionMembership);

  return router;
}
