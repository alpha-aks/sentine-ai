import { Router } from 'express';
import { MonitoringController } from '../controllers/monitoring.controller';
import { authenticateJwt, requireRole } from '../middleware/auth-middleware';

const router = Router();

// Apply auth & RBAC permissions for proctor monitoring routes
router.use(authenticateJwt);
router.use(requireRole(['LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'SUPER_ADMIN']));

// Active Exams Monitoring
router.get('/v1/monitoring/exams/active', MonitoringController.listActiveExams);
router.get('/v1/monitoring/exams/:examId', MonitoringController.getExamDetails);

// Candidates Monitoring & Timelines
router.get('/v1/monitoring/candidates', MonitoringController.listCandidates);
router.get('/v1/monitoring/candidates/:sessionId', MonitoringController.getCandidateDetails);
router.post('/v1/monitoring/candidates/:sessionId/heartbeat', MonitoringController.recordHeartbeat);
router.get('/v1/monitoring/candidates/:sessionId/risk', MonitoringController.getRiskSnapshot);
router.get('/v1/monitoring/candidates/:sessionId/timeline', MonitoringController.getTimeline);

// Evidence Metadata
router.get('/v1/monitoring/candidates/:sessionId/evidence', MonitoringController.listEvidence);
router.post('/v1/monitoring/candidates/:sessionId/evidence', MonitoringController.registerEvidence);

// Alert Management
router.get('/v1/monitoring/alerts', MonitoringController.listAlerts);
router.post('/v1/monitoring/alerts', MonitoringController.createAlert);
router.patch('/v1/monitoring/alerts/:alertId/status', MonitoringController.updateAlertStatus);

// Manual Proctor Actions
router.post('/v1/monitoring/candidates/:sessionId/actions', MonitoringController.executeManualAction);

// Overall Statistics
router.get('/v1/monitoring/stats', MonitoringController.getStats);

export default router;
