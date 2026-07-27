import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateJwt, rateLimiter } from '../middleware/auth-middleware';

export function createAuthRouter(controller?: AuthController): Router {
  const router = Router();
  const authController = controller || new AuthController();

  // Public Endpoints
  router.post('/register', rateLimiter(20, 60000), authController.register);
  router.post('/login', rateLimiter(5, 60000), authController.login);
  router.post('/refresh', rateLimiter(10, 60000), authController.refreshToken);
  router.post('/email/verify', rateLimiter(10, 60000), authController.verifyEmail);
  router.post('/password/forgot', rateLimiter(3, 3600000), authController.forgotPassword);
  router.post('/password/reset', rateLimiter(5, 60000), authController.resetPassword);
  router.post('/mfa/verify', rateLimiter(5, 60000), authController.verifyMfa);

  // Authenticated Endpoints
  router.use(authenticateJwt);

  router.post('/logout', authController.logout);
  router.get('/me', authController.getMe);
  router.post('/password/change', authController.changePassword);
  router.get('/sessions', authController.getSessions);
  router.delete('/sessions/:sessionId', authController.revokeSession);
  router.delete('/sessions', authController.revokeAllSessions);

  return router;
}
