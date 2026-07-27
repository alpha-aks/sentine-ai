import { Request, Response } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { ApiResponse } from '@sentinel-ai/types';

const service = new MonitoringService();

export class MonitoringController {
  public static listActiveExams(req: Request, res: Response): void {
    try {
      const data = service.listActiveExams();
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }

  public static getExamDetails(req: Request, res: Response): void {
    try {
      const { examId } = req.params;
      const data = service.getExamDetails(examId);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      const code = err.message.startsWith('EXAM_NOT_FOUND') ? 404 : 500;
      res.status(code).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
    }
  }

  public static listCandidates(req: Request, res: Response): void {
    try {
      const { examId, status } = req.query;
      const data = service.listCandidates(examId as string, status as any);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }

  public static getCandidateDetails(req: Request, res: Response): void {
    try {
      const { sessionId } = req.params;
      const data = service.getCandidateDetails(sessionId);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      const code = err.message.startsWith('CANDIDATE_NOT_FOUND') ? 404 : 500;
      res.status(code).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
    }
  }

  public static recordHeartbeat(req: Request, res: Response): void {
    try {
      const { sessionId } = req.params;
      const { status } = req.body || {};
      const data = service.recordHeartbeat(sessionId, status);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }

  public static getRiskSnapshot(req: Request, res: Response): void {
    try {
      const { sessionId } = req.params;
      const data = service.getRiskSnapshot(sessionId);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }

  public static getTimeline(req: Request, res: Response): void {
    try {
      const { sessionId } = req.params;
      const data = service.getActivityTimeline(sessionId);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }

  public static listEvidence(req: Request, res: Response): void {
    try {
      const { sessionId } = req.params;
      const data = service.getEvidenceList(sessionId);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }

  public static registerEvidence(req: Request, res: Response): void {
    try {
      const data = service.registerEvidence(req.body);
      res.status(201).json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: err.message } });
    }
  }

  public static listAlerts(req: Request, res: Response): void {
    try {
      const { examId, status } = req.query;
      const data = service.listAlerts(examId as string, status as string);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }

  public static createAlert(req: Request, res: Response): void {
    try {
      const data = service.createAlert(req.body);
      res.status(201).json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: err.message } });
    }
  }

  public static updateAlertStatus(req: Request, res: Response): void {
    try {
      const { alertId } = req.params;
      const { status, notes } = req.body;
      const proctorId = (req as any).user?.userId || 'proctor_1';

      const data = service.updateAlertStatus(alertId, status, proctorId, notes);
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      const code = err.message.startsWith('ALERT_NOT_FOUND') ? 404 : 400;
      res.status(code).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
    }
  }

  public static executeManualAction(req: Request, res: Response): void {
    try {
      const { sessionId } = req.params;
      const { examId, institutionId, actionType, notes } = req.body;
      const proctorId = (req as any).user?.userId || 'proctor_1';

      const data = service.executeManualAction({
        candidateSessionId: sessionId,
        examId,
        institutionId,
        proctorId,
        actionType,
        notes
      });

      res.status(200).json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(400).json({ success: false, error: { code: 'ACTION_FAILED', message: err.message } });
    }
  }

  public static getStats(req: Request, res: Response): void {
    try {
      const data = service.getSystemStats();
      res.json({ success: true, data } as ApiResponse<any>);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
    }
  }
}
