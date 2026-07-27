import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@sentinel-ai/types';
import { TenantRequest } from '../middleware/tenant-middleware';
import { QuestionService } from '../services/QuestionService';
import { QuestionFormat } from '../types/question';

// ─────────────────────────────────────────────────────────────────────────────
// QuestionController – maps HTTP requests to QuestionService calls
// ─────────────────────────────────────────────────────────────────────────────

export class QuestionController {
  private readonly service: QuestionService;

  constructor(service?: QuestionService) {
    this.service = service || new QuestionService();
  }

  public getService(): QuestionService {
    return this.service;
  }

  // ── Response helpers ────────────────────────────────────────────────────────

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

  private actorId(req: TenantRequest): string {
    return req.user?.sub || 'anonymous';
  }

  private institutionId(req: TenantRequest): string {
    return req.body?.institutionId || req.institutionId || 'inst_default';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  public createQuestion = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = await this.service.createQuestion(
        { ...req.body, institutionId: this.institutionId(req) },
        this.actorId(req)
      );
      this.sendResponse(res, 201, question, req);
    } catch (err) { next(err); }
  };

  public getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = await this.service.getQuestion(req.params.questionId);
      this.sendResponse(res, 200, question, req);
    } catch (err) { next(err); }
  };

  public updateQuestion = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.service.updateQuestion(req.params.questionId, req.body, this.actorId(req));
      this.sendResponse(res, 200, updated, req);
    } catch (err) { next(err); }
  };

  public deleteQuestion = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteQuestion(req.params.questionId, this.actorId(req));
      this.sendResponse(res, 200, { message: `Question ${req.params.questionId} deleted successfully` }, req);
    } catch (err) { next(err); }
  };

  public searchQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryDto = {
        institutionId: req.query.institutionId as string,
        bankId: req.query.bankId as string,
        type: req.query.type as any,
        difficulty: req.query.difficulty as any,
        status: req.query.status as any,
        categoryId: req.query.categoryId as string,
        tag: req.query.tag as string,
        query: req.query.q as string,
        page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 20
      };
      const result = await this.service.searchQuestions(queryDto);
      this.sendResponse(res, 200, result, req);
    } catch (err) { next(err); }
  };

  public updateApprovalStatus = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.service.updateApprovalStatus(
        req.params.questionId,
        req.body.status,
        this.actorId(req),
        req.body.rejectionReason
      );
      this.sendResponse(res, 200, updated, req);
    } catch (err) { next(err); }
  };

  // ── Attachments ─────────────────────────────────────────────────────────────

  public addAttachment = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attachment = await this.service.addAttachment(req.params.questionId, req.body);
      this.sendResponse(res, 201, attachment, req);
    } catch (err) { next(err); }
  };

  public deleteAttachment = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteAttachment(req.params.questionId, req.params.attachmentId);
      this.sendResponse(res, 200, { message: 'Attachment deleted' }, req);
    } catch (err) { next(err); }
  };

  // ── Version History ─────────────────────────────────────────────────────────

  public getVersionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const versions = await this.service.getVersionHistory(req.params.questionId);
      this.sendResponse(res, 200, { versions }, req);
    } catch (err) { next(err); }
  };

  public restoreVersion = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetVersion = parseInt(String(req.body.version), 10);
      const restored = await this.service.restoreVersion({
        questionId: req.params.questionId,
        targetVersion,
        actorUserId: this.actorId(req)
      });
      this.sendResponse(res, 200, restored, req);
    } catch (err) { next(err); }
  };

  // ── Analytics ───────────────────────────────────────────────────────────────

  public recordAttempt = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.service.recordAttempt({
        ...req.body,
        questionId: req.params.questionId
      });
      this.sendResponse(res, 200, analytics, req);
    } catch (err) { next(err); }
  };

  public getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.service.getAnalytics(req.params.questionId);
      this.sendResponse(res, 200, { analytics }, req);
    } catch (err) { next(err); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTION BANKS
  // ─────────────────────────────────────────────────────────────────────────

  public createBank = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bank = await this.service.createBank(
        { ...req.body, institutionId: this.institutionId(req) },
        this.actorId(req)
      );
      this.sendResponse(res, 201, bank, req);
    } catch (err) { next(err); }
  };

  public getBank = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bank = await this.service.getBank(req.params.bankId);
      this.sendResponse(res, 200, bank, req);
    } catch (err) { next(err); }
  };

  public updateBank = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bank = await this.service.updateBank(req.params.bankId, req.body, this.actorId(req));
      this.sendResponse(res, 200, bank, req);
    } catch (err) { next(err); }
  };

  public listBanks = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = (req.query.institutionId as string) || this.institutionId(req);
      const includeArchived = req.query.includeArchived === 'true';
      const banks = await this.service.listBanks(institutionId, includeArchived);
      this.sendResponse(res, 200, { banks }, req);
    } catch (err) { next(err); }
  };

  public archiveBank = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bank = await this.service.archiveBank(req.params.bankId, this.actorId(req));
      this.sendResponse(res, 200, bank, req);
    } catch (err) { next(err); }
  };

  public cloneBank = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newName = req.body.name || req.body.new_name || 'Cloned Question Bank';
      const cloned = await this.service.cloneBank(req.params.bankId, newName, this.actorId(req));
      this.sendResponse(res, 201, cloned, req);
    } catch (err) { next(err); }
  };

  public getBankAnalytics = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = this.institutionId(req);
      const summary = await this.service.getBankAnalyticsSummary(req.params.bankId, institutionId);
      this.sendResponse(res, 200, summary, req);
    } catch (err) { next(err); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // IMPORT / EXPORT
  // ─────────────────────────────────────────────────────────────────────────

  public importQuestions = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bankId = req.params.bankId;
      const institutionId = this.institutionId(req);
      const format: QuestionFormat = req.body.format || 'JSON';
      const content: string = req.body.content || JSON.stringify(req.body.questions || []);

      const job = await this.service.importQuestions(bankId, institutionId, content, format, this.actorId(req));
      this.sendResponse(res, 200, job, req);
    } catch (err) { next(err); }
  };

  public exportQuestions = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = (req.query.format as QuestionFormat) || 'JSON';
      const result = await this.service.exportQuestions(
        req.params.bankId,
        this.institutionId(req),
        format,
        this.actorId(req)
      );
      const contentType = format === 'JSON' ? 'application/json' : format === 'EXCEL' ? 'text/csv' : 'text/plain';
      res.setHeader('Content-Type', contentType);
      res.setHeader('X-Export-Job-Id', result.jobId);
      res.status(200).send(result.content);
    } catch (err) { next(err); }
  };

  public getExportTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = (req.query.format as QuestionFormat) || 'JSON';
      const template = this.service.getExportTemplate(format);
      this.sendResponse(res, 200, template, req);
    } catch (err) { next(err); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // POOLS
  // ─────────────────────────────────────────────────────────────────────────

  public createPool = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pool = await this.service.createPool({
        ...req.body,
        institutionId: this.institutionId(req)
      });
      this.sendResponse(res, 201, pool, req);
    } catch (err) { next(err); }
  };

  public getPool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pool = await this.service.getPool(req.params.poolId);
      this.sendResponse(res, 200, pool, req);
    } catch (err) { next(err); }
  };

  public updatePool = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pool = await this.service.updatePool(req.params.poolId, req.body);
      this.sendResponse(res, 200, pool, req);
    } catch (err) { next(err); }
  };

  public listPools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pools = await this.service.listPools(req.params.bankId);
      this.sendResponse(res, 200, { pools }, req);
    } catch (err) { next(err); }
  };

  public deletePool = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deletePool(req.params.poolId);
      this.sendResponse(res, 200, { message: 'Pool deleted' }, req);
    } catch (err) { next(err); }
  };

  public validatePool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.validatePool(req.params.poolId);
      this.sendResponse(res, 200, result, req);
    } catch (err) { next(err); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RANDOMIZATION
  // ─────────────────────────────────────────────────────────────────────────

  public getRandomizedQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questions = await this.service.getRandomizedQuestions({
        bankId: req.query.bankId as string,
        poolId: req.query.poolId as string,
        count: req.query.count ? parseInt(String(req.query.count), 10) : 10,
        seed: req.query.seed as string,
        randomizeOptions: req.query.randomizeOptions === 'true',
        difficultyFilter: req.query.difficulty as any
      });
      this.sendResponse(res, 200, { questions }, req);
    } catch (err) { next(err); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────

  public createCategory = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.createCategory({
        ...req.body,
        institutionId: this.institutionId(req)
      });
      this.sendResponse(res, 201, category, req);
    } catch (err) { next(err); }
  };

  public listCategories = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = (req.query.institutionId as string) || this.institutionId(req);
      const categories = await this.service.listCategories(institutionId);
      this.sendResponse(res, 200, { categories }, req);
    } catch (err) { next(err); }
  };

  public deleteCategory = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteCategory(req.params.categoryId, this.institutionId(req));
      this.sendResponse(res, 200, { message: 'Category deleted' }, req);
    } catch (err) { next(err); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAGS
  // ─────────────────────────────────────────────────────────────────────────

  public createTag = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tag = await this.service.createTag({
        ...req.body,
        institutionId: this.institutionId(req)
      });
      this.sendResponse(res, 201, tag, req);
    } catch (err) { next(err); }
  };

  public listTags = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = (req.query.institutionId as string) || this.institutionId(req);
      const tags = await this.service.listTags(institutionId);
      this.sendResponse(res, 200, { tags }, req);
    } catch (err) { next(err); }
  };

  public deleteTag = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteTag(req.params.tagId, this.institutionId(req));
      this.sendResponse(res, 200, { message: 'Tag deleted' }, req);
    } catch (err) { next(err); }
  };
}
