import { Router } from 'express';
import { visionFoundationController } from '../controllers/vision-foundation.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public Health & Status Endpoints
router.get('/health', (req, res) => visionFoundationController.getHealth(req, res));
router.get('/status', (req, res) => visionFoundationController.getStatus(req, res));
router.get('/metrics', (req, res) => visionFoundationController.getMetrics(req, res));

// Authenticated Runtime Config Endpoint
router.get('/api/v1/vision/config', authMiddleware, (req, res) => visionFoundationController.getConfig(req, res));

export default router;
