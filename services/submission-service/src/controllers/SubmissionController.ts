import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth-middleware';
import { TenantRequest } from '../middleware/tenant-middleware';
import { SubmissionService } from '../services/SubmissionService';
import {
  AutoSubmitDto,
  AutosaveDraftDto,
  BatchAutosaveDto,
  LockSubmissionDto,
  SaveAnswerDto,
  StartSubmissionDto,
  SubmissionStatus,
  SubmitFinalDto,
  UploadFileDto
} from '../types/submission';

type Req = TenantRequest & { body: any; params: any; query: any };

function ok(res: Response, data: unknown, status: number = 200): void {
  res.status(status).json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() }
  });
}

export class SubmissionController {
  private readonly service: SubmissionService;

  constructor(service?: SubmissionService) {
    this.service = service || new SubmissionService();

    this.startSubmission = this.startSubmission.bind(this);
    this.getSubmission = this.getSubmission.bind(this);
    this.getSubmissionBySession = this.getSubmissionBySession.bind(this);
    this.listSubmissionsByExam = this.listSubmissionsByExam.bind(this);
    this.saveAnswer = this.saveAnswer.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.batchAutosave = this.batchAutosave.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.getFile = this.getFile.bind(this);
    this.submitFinal = this.submitFinal.bind(this);
    this.autoSubmit = this.autoSubmit.bind(this);
    this.lockSubmission = this.lockSubmission.bind(this);
    this.getRecoveryState = this.getRecoveryState.bind(this);
    this.getAnswerVersions = this.getAnswerVersions.bind(this);
    this.restoreDraft = this.restoreDraft.bind(this);
    this.reviewSubmission = this.reviewSubmission.bind(this);
    this.getSubmissionStatus = this.getSubmissionStatus.bind(this);
    this.getSubmissionHistory = this.getSubmissionHistory.bind(this);
    this.validateSubmission = this.validateSubmission.bind(this);
    this.getSubmissionAnalytics = this.getSubmissionAnalytics.bind(this);
  }

  public async startSubmission(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: StartSubmissionDto = req.body;
      const result = await this.service.startSubmission(dto, actorUserId);
      ok(res, result, 201);
    } catch (err) { next(err); }
  }

  public async getSubmission(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { submissionId } = req.params;
      const result = await this.service.getSubmission(submissionId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async getSubmissionBySession(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const result = await this.service.getSubmissionBySession(sessionId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async listSubmissionsByExam(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const statusFilter = req.query.status as SubmissionStatus | undefined;
      const list = await this.service.listSubmissionsByExam(examId, statusFilter);
      ok(res, { items: list, total: list.length });
    } catch (err) { next(err); }
  }

  public async saveAnswer(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: SaveAnswerDto = req.body;
      const answer = await this.service.saveAnswer(req.params.submissionId, dto, actorUserId);
      ok(res, answer);
    } catch (err) { next(err); }
  }

  public async saveDraft(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: AutosaveDraftDto = req.body;
      const result = await this.service.saveDraft(req.params.submissionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async batchAutosave(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: BatchAutosaveDto = req.body;
      const result = await this.service.batchAutosave(req.params.submissionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async uploadFile(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: UploadFileDto = req.body;
      const file = await this.service.uploadFile(req.params.submissionId, dto, actorUserId);
      ok(res, file, 201);
    } catch (err) { next(err); }
  }

  public async getFile(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.service.getFile(req.params.fileId);
      ok(res, file);
    } catch (err) { next(err); }
  }

  public async submitFinal(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: SubmitFinalDto = req.body;
      const result = await this.service.submitFinal(req.params.submissionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async autoSubmit(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: AutoSubmitDto = req.body;
      const result = await this.service.autoSubmit(req.params.submissionId, dto);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async lockSubmission(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: LockSubmissionDto = req.body;
      const submission = await this.service.lockSubmission(req.params.submissionId, dto, actorUserId);
      ok(res, submission);
    } catch (err) { next(err); }
  }

  public async getRecoveryState(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const recovery = await this.service.getRecoveryState(req.params.submissionId);
      ok(res, recovery);
    } catch (err) { next(err); }
  }

  public async getAnswerVersions(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { submissionId, questionId } = req.params;
      const versions = await this.service.getAnswerVersions(submissionId, questionId);
      ok(res, { items: versions, total: versions.length });
    } catch (err) { next(err); }
  }

  public async restoreDraft(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const questionId = req.params.questionId || req.body.questionId;
      const targetVersion = req.body.targetVersion ? Number(req.body.targetVersion) : undefined;
      const result = await this.service.restoreDraft(req.params.submissionId, { questionId, targetVersion }, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async reviewSubmission(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const result = await this.service.reviewSubmission(req.params.submissionId, req.body, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async getSubmissionStatus(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await this.service.getSubmissionStatus(req.params.submissionId);
      ok(res, status);
    } catch (err) { next(err); }
  }

  public async getSubmissionHistory(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await this.service.getSubmissionHistory(req.params.submissionId);
      ok(res, history);
    } catch (err) { next(err); }
  }

  public async validateSubmission(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const requiredIds = (req.query.requiredQuestionIds as string)?.split(',').filter(Boolean) || [];
      const validation = await this.service.validateSubmission(req.params.submissionId, requiredIds);
      ok(res, validation);
    } catch (err) { next(err); }
  }

  public async getSubmissionAnalytics(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await this.service.getSubmissionAnalytics(req.params.submissionId);
      ok(res, analytics);
    } catch (err) { next(err); }
  }
}
