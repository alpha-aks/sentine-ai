import { Router } from 'express';
import { VisionController } from '../controllers/vision.controller';
import { authenticateJwt, enforceTenantIsolation, visionRateLimiter } from '../middleware/auth.middleware';

const router = Router();
const controller = new VisionController();

// Unauthenticated health check endpoint
router.get('/health', controller.getHealth);

// Authenticated & Tenant-Isolated Vision Guard API Endpoints
router.get('/api/v1/vision/status', authenticateJwt, enforceTenantIsolation, controller.getStatus);
router.get('/api/v1/vision/config', authenticateJwt, enforceTenantIsolation, controller.getConfig);
router.patch('/api/v1/vision/config', authenticateJwt, enforceTenantIsolation, controller.updateConfig);
router.get('/api/v1/vision/metrics', authenticateJwt, enforceTenantIsolation, controller.getMetrics);

router.post('/api/v1/vision/stream/start', authenticateJwt, enforceTenantIsolation, controller.startStream);
router.post('/api/v1/vision/stream/stop', authenticateJwt, enforceTenantIsolation, controller.stopStream);
router.post('/api/v1/vision/frame', authenticateJwt, enforceTenantIsolation, visionRateLimiter, controller.processFrame);

export default router;
