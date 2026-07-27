import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@sentinel-ai/types';
import { TenantRequest } from '../middleware/tenant-middleware';
import { ExamService } from '../services/ExamService';

export class ExamController {
  private readonly service: ExamService;

  constructor(service?: ExamService) {
    this.service = service || new ExamService();
  }

  public getService(): ExamService {
    return this.service;
  }

  private sendResponse<T>(res: Response, statusCode: number, data: T, req: Request): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    };
    res.status(statusCode).json(response);
  }

  public createExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUserId = req.user!.sub;
      const institutionId = req.body.institutionId || req.institutionId || 'inst_default';
      const exam = await this.service.createExam(
        {
          ...req.body,
          institutionId
        },
        actorUserId
      );
      this.sendResponse(res, 201, exam, req);
    } catch (err) {
      next(err);
    }
  };

  public getExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const exam = await this.service.getExam(examId);
      this.sendResponse(res, 200, exam, req);
    } catch (err) {
      next(err);
    }
  };

  public updateExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const updated = await this.service.updateExam(examId, req.body);
      this.sendResponse(res, 200, updated, req);
    } catch (err) {
      next(err);
    }
  };

  public deleteExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      await this.service.deleteExam(examId);
      this.sendResponse(res, 200, { message: `Exam ${examId} deleted successfully` }, req);
    } catch (err) {
      next(err);
    }
  };

  public searchExams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryDto = {
        institutionId: req.query.institutionId as string,
        query: req.query.q as string,
        type: req.query.type as any,
        status: req.query.status as any,
        page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 20
      };
      const result = await this.service.searchExams(queryDto);
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };

  public scheduleExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const scheduled = await this.service.scheduleExam(examId, {
        startTime: req.body.startTime || req.body.start_time,
        endTime: req.body.endTime || req.body.end_time,
        registrationWindowStart: req.body.registrationWindowStart || req.body.registration_window_start,
        registrationWindowEnd: req.body.registrationWindowEnd || req.body.registration_window_end,
        timezone: req.body.timezone,
        lateEntryPolicy: req.body.lateEntryPolicy || req.body.late_entry_policy,
        gracePeriodMinutes: req.body.gracePeriodMinutes || req.body.grace_period_minutes
      });
      this.sendResponse(res, 200, scheduled, req);
    } catch (err) {
      next(err);
    }
  };

  public publishExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const actorUserId = req.user!.sub;
      const published = await this.service.publishExam(examId, actorUserId, req.body.notes);
      this.sendResponse(res, 200, published, req);
    } catch (err) {
      next(err);
    }
  };

  public archiveExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const archived = await this.service.archiveExam(examId);
      this.sendResponse(res, 200, archived, req);
    } catch (err) {
      next(err);
    }
  };

  public activateExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const activated = await this.service.activateExam(examId);
      this.sendResponse(res, 200, activated, req);
    } catch (err) {
      next(err);
    }
  };

  public deactivateExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const deactivated = await this.service.deactivateExam(examId);
      this.sendResponse(res, 200, deactivated, req);
    } catch (err) {
      next(err);
    }
  };

  public cancelExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const cancelled = await this.service.cancelExam(examId, req.body.reason);
      this.sendResponse(res, 200, cancelled, req);
    } catch (err) {
      next(err);
    }
  };

  public duplicateExam = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const actorUserId = req.user!.sub;
      const newCode = req.body.newCode || req.body.new_code || `${Date.now()}`;
      const duplicated = await this.service.duplicateExam(examId, newCode, actorUserId);
      this.sendResponse(res, 201, duplicated, req);
    } catch (err) {
      next(err);
    }
  };

  public updateRules = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const rules = await this.service.updateRules(examId, req.body);
      this.sendResponse(res, 200, { rules }, req);
    } catch (err) {
      next(err);
    }
  };

  public updatePolicy = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const policy = await this.service.updatePolicy(examId, req.body);
      this.sendResponse(res, 200, { policy }, req);
    } catch (err) {
      next(err);
    }
  };

  public updateSections = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const sections = await this.service.updateSections(examId, req.body.sections || req.body);
      this.sendResponse(res, 200, { sections }, req);
    } catch (err) {
      next(err);
    }
  };

  public updateEligibility = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const eligibility = await this.service.updateEligibility(examId, req.body);
      this.sendResponse(res, 200, { eligibility }, req);
    } catch (err) {
      next(err);
    }
  };

  public checkEligibility = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.examId;
      const candidateId = req.params.candidateId || req.user!.sub;
      const result = await this.service.checkCandidateEligibility(
        examId,
        candidateId,
        req.query.departmentId as string
      );
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };

  public createTemplate = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUserId = req.user!.sub;
      const institutionId = req.body.institutionId || req.institutionId || 'inst_default';
      const template = await this.service.createTemplate(
        institutionId,
        req.body.name,
        req.body.description,
        actorUserId
      );
      this.sendResponse(res, 201, template, req);
    } catch (err) {
      next(err);
    }
  };
}
