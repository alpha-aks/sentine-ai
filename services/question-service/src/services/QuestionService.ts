import { generateUuid, sha256Hash } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import { QuestionCache } from '../cache/QuestionCache';
import { getQuestionServiceConfig, QuestionServiceConfig } from '../config/question-config';
import { QuestionRepository } from '../db/QuestionRepository';
import { QuestionEventPublisher } from '../events/QuestionEventPublisher';
import {
  CreateCategoryDto,
  CreateQuestionBankDto,
  CreateQuestionDto,
  CreateQuestionPoolDto,
  CreateTagDto,
  DifficultyLevel,
  ExportTemplateDto,
  PoolValidationResult,
  QuestionAnalyticsEntity,
  QuestionApprovalStatus,
  QuestionAttachmentEntity,
  QuestionBankEntity,
  QuestionCategoryEntity,
  QuestionEntity,
  QuestionExportJobEntity,
  QuestionFormat,
  QuestionImportJobEntity,
  QuestionOptionEntity,
  QuestionPoolEntity,
  QuestionResponseDto,
  QuestionSearchQueryDto,
  QuestionTagEntity,
  QuestionType,
  QuestionVersionEntity,
  RandomSelectionQueryDto,
  RecordAttemptDto,
  RestoreVersionDto,
  UpdateQuestionBankDto,
  UpdateQuestionDto,
  UpdateQuestionPoolDto
} from '../types/question';
import { AnalyticsEngine } from './AnalyticsEngine';
import { ImportExportEngine } from './ImportExportEngine';
import { RandomizationEngine } from './RandomizationEngine';

// ─────────────────────────────────────────────────────────────────────────────
// QuestionService – orchestrates all question-service features
// ─────────────────────────────────────────────────────────────────────────────

export class QuestionService {
  private readonly repository: QuestionRepository;
  private readonly cache: QuestionCache;
  private readonly eventPublisher: QuestionEventPublisher;
  private readonly randomizationEngine: RandomizationEngine;
  private readonly importExportEngine: ImportExportEngine;
  private readonly analyticsEngine: AnalyticsEngine;
  private readonly config: QuestionServiceConfig;
  private readonly logger: Logger;

  constructor(
    repository?: QuestionRepository,
    cache?: QuestionCache,
    eventPublisher?: QuestionEventPublisher,
    config?: QuestionServiceConfig
  ) {
    this.repository = repository || new QuestionRepository();
    this.config = config || getQuestionServiceConfig();
    this.cache = cache || new QuestionCache(this.config.cacheTtlSeconds);
    this.eventPublisher = eventPublisher || new QuestionEventPublisher();
    this.randomizationEngine = new RandomizationEngine();
    this.importExportEngine = new ImportExportEngine();
    this.analyticsEngine = new AnalyticsEngine();
    this.logger = new Logger({ serviceName: 'question-service' });
  }

  // ── Accessors (for test injection) ─────────────────────────────────────────

  public getRepository(): QuestionRepository { return this.repository; }
  public getCache(): QuestionCache { return this.cache; }

  // ── Audit helper ────────────────────────────────────────────────────────────

  private auditLog(
    action: string,
    message: string,
    opts: { userId: string; institutionId?: string; resourceId?: string; metadata?: Record<string, unknown> }
  ): void {
    this.logger.audit(action, message, {
      action,
      userId: opts.userId,
      institutionId: opts.institutionId || 'unknown',
      resourceId: opts.resourceId,
      payload: opts.metadata
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 1. QUESTION CRUD & VALIDATION
  // ────────────────────────────────────────────────────────────────────────────

  private validateQuestionDto(dto: CreateQuestionDto): void {
    if (!dto.title?.trim()) {
      throw new Error('QUESTION_INVALID_INPUT: Question title is required');
    }
    if (!dto.body?.trim()) {
      throw new Error('QUESTION_INVALID_INPUT: Question body is required');
    }

    // Type-specific rules
    const optionTypes: QuestionType[] = ['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE'];
    if (optionTypes.includes(dto.type)) {
      if (!dto.options || dto.options.length < 2) {
        throw new Error(`QUESTION_INVALID_INPUT: ${dto.type} requires at least 2 options`);
      }
      const correctCount = dto.options.filter(o => o.isCorrect).length;
      if (correctCount === 0) {
        throw new Error('QUESTION_INVALID_INPUT: At least one correct answer option must be specified');
      }
      if (dto.type === 'MCQ_SINGLE' && correctCount > 1) {
        throw new Error('QUESTION_INVALID_INPUT: MCQ_SINGLE can have exactly 1 correct option');
      }
      if (dto.type === 'TRUE_FALSE' && dto.options.length !== 2) {
        throw new Error('QUESTION_INVALID_INPUT: TRUE_FALSE must have exactly 2 options');
      }
    }

    if (dto.type === 'MATCHING') {
      if (!dto.matchingPairs || Object.keys(dto.matchingPairs).length < 2) {
        throw new Error('QUESTION_INVALID_INPUT: MATCHING type requires at least 2 matching pairs');
      }
    }

    if (dto.type === 'ORDERING') {
      if (!dto.orderingSequence || dto.orderingSequence.length < 2) {
        throw new Error('QUESTION_INVALID_INPUT: ORDERING type requires at least 2 sequence items');
      }
    }

    if (dto.type === 'NUMERICAL') {
      if (!dto.acceptedVariations || dto.acceptedVariations.length === 0) {
        if (!dto.numericalTolerance && dto.numericalTolerance !== 0) {
          throw new Error('QUESTION_INVALID_INPUT: NUMERICAL type requires acceptedVariations or numericalTolerance');
        }
      }
    }

    if (dto.type === 'CODE_SNIPPET' && !dto.codeLanguage) {
      throw new Error('QUESTION_INVALID_INPUT: CODE_SNIPPET type requires codeLanguage');
    }

    if (dto.marks !== undefined && dto.marks < 0) {
      throw new Error('QUESTION_INVALID_INPUT: marks cannot be negative');
    }

    if (dto.negativeMarks !== undefined && dto.negativeMarks < 0) {
      throw new Error('QUESTION_INVALID_INPUT: negativeMarks cannot be negative');
    }
  }

  private async createQuestionInternal(
    dto: CreateQuestionDto,
    actorUserId: string,
    skipDuplicateCheck: boolean = false
  ): Promise<QuestionResponseDto> {
    this.validateQuestionDto(dto);

    const questionId = generateUuid();
    const now = new Date().toISOString();
    const contentHash = this.importExportEngine.contentHash(dto.title, dto.body);

    // Duplicate check (skipped during internal clone operations)
    if (!skipDuplicateCheck && this.repository.isDuplicate(dto.institutionId, contentHash)) {
      throw new Error('QUESTION_DUPLICATE: A question with identical title and body already exists in this institution');
    }

    const entity: QuestionEntity = {
      questionId,
      bankId: dto.bankId,
      institutionId: dto.institutionId,
      departmentId: dto.departmentId || null,
      courseId: dto.courseId || null,
      type: dto.type,
      title: dto.title.trim(),
      body: dto.body.trim(),
      instructions: dto.instructions || null,
      status: 'DRAFT',
      difficulty: dto.difficulty || 'MEDIUM',
      marks: dto.marks !== undefined ? dto.marks : 1,
      negativeMarks: dto.negativeMarks !== undefined ? dto.negativeMarks : 0,
      estimatedTimeSeconds: dto.estimatedTimeSeconds || 60,
      hints: dto.hints || [],
      explanation: dto.explanation || null,
      codeTemplate: dto.codeTemplate || null,
      codeLanguage: dto.codeLanguage || null,
      acceptedVariations: dto.acceptedVariations || [],
      numericalTolerance: dto.numericalTolerance !== undefined ? dto.numericalTolerance : null,
      matchingPairs: dto.matchingPairs || null,
      orderingSequence: dto.orderingSequence || null,
      tags: dto.tags || [],
      categoryId: dto.categoryId || null,
      referenceMaterial: dto.referenceMaterial || null,
      metaData: dto.metaData || {},
      version: 1,
      approvedById: null,
      approvedAt: null,
      rejectionReason: null,
      contentHash,
      createdById: actorUserId,
      createdAt: now,
      updatedAt: now
    };

    const optionEntities: QuestionOptionEntity[] = (dto.options || []).map((opt, idx) => ({
      optionId: generateUuid(),
      questionId,
      text: opt.text.trim(),
      isCorrect: opt.isCorrect,
      explanation: opt.explanation || null,
      sequenceOrder: idx + 1
    }));

    await this.repository.createQuestion(entity, optionEntities, skipDuplicateCheck);
    await this.eventPublisher.publishQuestionCreated(entity);

    this.auditLog('QUESTION_CREATED', `Question "${entity.title}" created`, {
      userId: actorUserId, institutionId: dto.institutionId, resourceId: questionId,
      metadata: { type: dto.type, difficulty: dto.difficulty }
    });

    return this.getQuestion(questionId);
  }

  public async createQuestion(dto: CreateQuestionDto, actorUserId: string): Promise<QuestionResponseDto> {
    return this.createQuestionInternal(dto, actorUserId, false);
  }

  public async getQuestion(questionId: string): Promise<QuestionResponseDto> {
    const cached = this.cache.getQuestion(questionId);
    if (cached) return cached;

    const question = await this.repository.findQuestionById(questionId);
    if (!question) throw new Error(`QUESTION_NOT_FOUND: Question ${questionId} not found`);

    const [options, versions, attachments] = await Promise.all([
      this.repository.getOptions(questionId),
      this.repository.getVersions(questionId),
      this.repository.getAttachments(questionId)
    ]);

    const response: QuestionResponseDto = { question, options, attachments, versions };
    this.cache.setQuestion(questionId, response);
    return response;
  }

  public async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto,
    actorUserId: string
  ): Promise<QuestionResponseDto> {
    const existing = await this.repository.findQuestionById(questionId);
    if (!existing) throw new Error(`QUESTION_NOT_FOUND: Question ${questionId} not found`);

    // Recalculate content hash if title/body changed
    const newTitle = dto.title !== undefined ? dto.title : existing.title;
    const newBody = dto.body !== undefined ? dto.body : existing.body;
    const contentHash = this.importExportEngine.contentHash(newTitle, newBody);

    // Check duplicate only if content actually changed
    if (contentHash !== existing.contentHash && this.repository.isDuplicate(existing.institutionId, contentHash)) {
      throw new Error('QUESTION_DUPLICATE: A question with identical content already exists');
    }

    let updatedOptions: QuestionOptionEntity[] | undefined;
    if (dto.options) {
      updatedOptions = dto.options.map((opt, idx) => ({
        optionId: generateUuid(),
        questionId,
        text: opt.text.trim(),
        isCorrect: opt.isCorrect,
        explanation: opt.explanation || null,
        sequenceOrder: idx + 1
      }));
    }

    const updates: Partial<QuestionEntity> = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.body !== undefined && { body: dto.body }),
      ...(dto.instructions !== undefined && { instructions: dto.instructions }),
      ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
      ...(dto.marks !== undefined && { marks: dto.marks }),
      ...(dto.negativeMarks !== undefined && { negativeMarks: dto.negativeMarks }),
      ...(dto.estimatedTimeSeconds !== undefined && { estimatedTimeSeconds: dto.estimatedTimeSeconds }),
      ...(dto.hints !== undefined && { hints: dto.hints }),
      ...(dto.explanation !== undefined && { explanation: dto.explanation }),
      ...(dto.codeTemplate !== undefined && { codeTemplate: dto.codeTemplate }),
      ...(dto.codeLanguage !== undefined && { codeLanguage: dto.codeLanguage }),
      ...(dto.acceptedVariations !== undefined && { acceptedVariations: dto.acceptedVariations }),
      ...(dto.numericalTolerance !== undefined && { numericalTolerance: dto.numericalTolerance }),
      ...(dto.matchingPairs !== undefined && { matchingPairs: dto.matchingPairs }),
      ...(dto.orderingSequence !== undefined && { orderingSequence: dto.orderingSequence }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.referenceMaterial !== undefined && { referenceMaterial: dto.referenceMaterial }),
      ...(dto.metaData !== undefined && { metaData: dto.metaData }),
      contentHash
    };

    await this.repository.updateQuestion(
      questionId,
      updates,
      updatedOptions,
      dto.changeSummary || 'Updated question',
      actorUserId
    );

    this.cache.invalidateQuestion(questionId);
    const updated = await this.repository.findQuestionById(questionId);
    await this.eventPublisher.publishQuestionUpdated(updated!);

    this.auditLog('QUESTION_UPDATED', `Question "${questionId}" updated`, {
      userId: actorUserId, resourceId: questionId,
      metadata: { changeSummary: dto.changeSummary }
    });

    return this.getQuestion(questionId);
  }

  public async deleteQuestion(questionId: string, actorUserId: string = 'system'): Promise<void> {
    const existing = await this.repository.findQuestionById(questionId);
    if (!existing) throw new Error(`QUESTION_NOT_FOUND: Question ${questionId} not found`);

    await this.repository.deleteQuestion(questionId);
    this.cache.invalidateQuestion(questionId);
    await this.eventPublisher.publishQuestionDeleted(questionId);

    this.auditLog('QUESTION_DELETED', `Question "${questionId}" deleted`, {
      userId: actorUserId, resourceId: questionId
    });
  }

  public async searchQuestions(
    queryDto: QuestionSearchQueryDto
  ): Promise<{ items: QuestionResponseDto[]; total: number }> {
    const { items, total } = await this.repository.searchQuestions(queryDto);
    const result: QuestionResponseDto[] = [];
    for (const q of items) {
      result.push(await this.getQuestion(q.questionId));
    }
    return { items: result, total };
  }

  // ── Attachments ─────────────────────────────────────────────────────────────

  public async addAttachment(
    questionId: string,
    attachment: Omit<QuestionAttachmentEntity, 'attachmentId' | 'questionId' | 'uploadedAt'>
  ): Promise<QuestionAttachmentEntity> {
    const question = await this.repository.findQuestionById(questionId);
    if (!question) throw new Error(`QUESTION_NOT_FOUND: Question ${questionId} not found`);

    const entity: QuestionAttachmentEntity = {
      attachmentId: generateUuid(),
      questionId,
      uploadedAt: new Date().toISOString(),
      ...attachment
    };
    const saved = await this.repository.addAttachment(entity);
    this.cache.invalidateQuestion(questionId);
    return saved;
  }

  public async deleteAttachment(questionId: string, attachmentId: string): Promise<void> {
    await this.repository.deleteAttachment(questionId, attachmentId);
    this.cache.invalidateQuestion(questionId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. APPROVAL WORKFLOW
  // ────────────────────────────────────────────────────────────────────────────

  public async updateApprovalStatus(
    questionId: string,
    status: QuestionApprovalStatus,
    actorUserId: string,
    rejectionReason?: string
  ): Promise<QuestionResponseDto> {
    const question = await this.repository.findQuestionById(questionId);
    if (!question) throw new Error(`QUESTION_NOT_FOUND: Question ${questionId} not found`);

    const updates: Partial<QuestionEntity> = { status };
    if (status === 'APPROVED') {
      updates.approvedById = actorUserId;
      updates.approvedAt = new Date().toISOString();
    }
    if (status === 'REJECTED' && rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }

    await this.repository.updateQuestion(
      questionId,
      updates,
      undefined,
      `Status changed to ${status}`,
      actorUserId
    );

    this.cache.invalidateQuestion(questionId);

    if (status === 'APPROVED') await this.eventPublisher.publishQuestionApproved(questionId, actorUserId);
    if (status === 'ARCHIVED') await this.eventPublisher.publishQuestionArchived(questionId);

    this.auditLog('QUESTION_STATUS_CHANGED', `Question ${questionId} status changed to ${status}`, {
      userId: actorUserId, resourceId: questionId,
      metadata: { status, rejectionReason }
    });

    return this.getQuestion(questionId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. VERSION MANAGEMENT
  // ────────────────────────────────────────────────────────────────────────────

  public async getVersionHistory(questionId: string): Promise<QuestionVersionEntity[]> {
    const question = await this.repository.findQuestionById(questionId);
    if (!question) throw new Error(`QUESTION_NOT_FOUND: Question ${questionId} not found`);
    return this.repository.getVersions(questionId);
  }

  public async restoreVersion(dto: RestoreVersionDto): Promise<QuestionResponseDto> {
    const { questionId, targetVersion, actorUserId } = dto;
    const versionSnapshot = await this.repository.getVersionByNumber(questionId, targetVersion);
    if (!versionSnapshot) {
      throw new Error(`QUESTION_NOT_FOUND: Version ${targetVersion} for question ${questionId} not found`);
    }

    const snapshot = versionSnapshot.snapshotData;
    await this.repository.updateQuestion(
      questionId,
      {
        title: versionSnapshot.title,
        body: versionSnapshot.body,
        ...(snapshot as Partial<QuestionEntity>)
      },
      versionSnapshot.options,
      `Restored to version ${targetVersion}`,
      actorUserId
    );

    this.cache.invalidateQuestion(questionId);
    const updated = await this.repository.findQuestionById(questionId);
    await this.eventPublisher.publishQuestionUpdated(updated!);

    this.auditLog('QUESTION_VERSION_RESTORED', `Question ${questionId} restored to v${targetVersion}`, {
      userId: actorUserId, resourceId: questionId,
      metadata: { targetVersion }
    });

    return this.getQuestion(questionId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. QUESTION BANKS
  // ────────────────────────────────────────────────────────────────────────────

  public async createBank(dto: CreateQuestionBankDto, actorUserId: string): Promise<QuestionBankEntity> {
    if (!dto.name?.trim()) throw new Error('QUESTION_INVALID_INPUT: Bank name is required');
    if (!dto.subject?.trim()) throw new Error('QUESTION_INVALID_INPUT: Bank subject is required');

    const bankId = generateUuid();
    const now = new Date().toISOString();

    const bank: QuestionBankEntity = {
      bankId,
      institutionId: dto.institutionId,
      departmentId: dto.departmentId || null,
      courseId: dto.courseId || null,
      subject: dto.subject.trim(),
      name: dto.name.trim(),
      description: dto.description || null,
      version: 1,
      isArchived: false,
      questionCount: 0,
      createdById: actorUserId,
      createdAt: now,
      updatedAt: now
    };

    await this.repository.createBank(bank);
    this.cache.invalidateBankList(dto.institutionId);
    await this.eventPublisher.publishQuestionBankCreated(bank);

    this.auditLog('BANK_CREATED', `Bank "${bank.name}" created`, {
      userId: actorUserId, institutionId: dto.institutionId, resourceId: bankId,
      metadata: { subject: dto.subject }
    });

    return bank;
  }

  public async getBank(bankId: string): Promise<QuestionBankEntity> {
    const cached = this.cache.getBank(bankId);
    if (cached) return cached;

    const bank = await this.repository.findBankById(bankId);
    if (!bank) throw new Error(`QUESTION_NOT_FOUND: Question bank ${bankId} not found`);

    this.cache.setBank(bankId, bank);
    return bank;
  }

  public async updateBank(
    bankId: string,
    dto: UpdateQuestionBankDto,
    actorUserId: string
  ): Promise<QuestionBankEntity> {
    const existing = await this.getBank(bankId);

    const updates: Partial<QuestionBankEntity> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.subject !== undefined && { subject: dto.subject }),
      ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
      ...(dto.courseId !== undefined && { courseId: dto.courseId }),
      version: existing.version + 1
    };

    const updated = await this.repository.updateBank(bankId, updates);
    this.cache.invalidateBank(bankId, existing.institutionId);
    return updated;
  }

  public async listBanks(
    institutionId: string,
    includeArchived: boolean = false
  ): Promise<QuestionBankEntity[]> {
    const cacheKey = includeArchived ? `${institutionId}_all` : institutionId;
    const cached = this.cache.getBankList(cacheKey);
    if (cached) return cached;

    const banks = await this.repository.listBanks(institutionId, includeArchived);
    this.cache.setBankList(cacheKey, banks);
    return banks;
  }

  public async archiveBank(bankId: string, actorUserId: string): Promise<QuestionBankEntity> {
    const bank = await this.getBank(bankId);
    const archived = await this.repository.archiveBank(bankId);
    this.cache.invalidateBank(bankId, bank.institutionId);

    this.auditLog('BANK_ARCHIVED', `Bank ${bankId} archived`, {
      userId: actorUserId, resourceId: bankId
    });

    return archived;
  }

  public async cloneBank(bankId: string, newName: string, actorUserId: string): Promise<QuestionBankEntity> {
    const source = await this.getBank(bankId);
    if (!newName?.trim()) throw new Error('QUESTION_INVALID_INPUT: New bank name is required for cloning');

    const clonedBank = await this.createBank(
      {
        institutionId: source.institutionId,
        departmentId: source.departmentId || undefined,
        courseId: source.courseId || undefined,
        subject: source.subject,
        name: newName.trim(),
        description: source.description ? `Clone of ${source.name}: ${source.description}` : `Clone of ${source.name}`
      },
      actorUserId
    );

    const { items } = await this.searchQuestions({ bankId, limit: 1000 });
    for (const item of items) {
      await this.createQuestionInternal(
        {
          bankId: clonedBank.bankId,
          institutionId: clonedBank.institutionId,
          departmentId: clonedBank.departmentId || undefined,
          courseId: clonedBank.courseId || undefined,
          type: item.question.type,
          title: item.question.title,
          body: item.question.body,
          instructions: item.question.instructions || undefined,
          difficulty: item.question.difficulty,
          marks: item.question.marks,
          negativeMarks: item.question.negativeMarks,
          estimatedTimeSeconds: item.question.estimatedTimeSeconds,
          hints: item.question.hints,
          explanation: item.question.explanation || undefined,
          codeTemplate: item.question.codeTemplate || undefined,
          codeLanguage: item.question.codeLanguage || undefined,
          acceptedVariations: item.question.acceptedVariations,
          numericalTolerance: item.question.numericalTolerance || undefined,
          matchingPairs: item.question.matchingPairs || undefined,
          orderingSequence: item.question.orderingSequence || undefined,
          options: item.options?.map(o => ({
            text: o.text,
            isCorrect: o.isCorrect,
            explanation: o.explanation || undefined
          })),
          tags: item.question.tags,
          categoryId: item.question.categoryId || undefined,
          referenceMaterial: item.question.referenceMaterial || undefined,
          metaData: item.question.metaData
        },
        actorUserId,
        true // skipDuplicateCheck – intentional clone within same institution
      );
    }

    this.auditLog('BANK_CLONED', `Bank ${bankId} cloned as "${newName}"`, {
      userId: actorUserId, resourceId: clonedBank.bankId,
      metadata: { sourceBankId: bankId, questionCount: items.length }
    });

    return clonedBank;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 5. QUESTION POOLS
  // ────────────────────────────────────────────────────────────────────────────

  public async createPool(dto: CreateQuestionPoolDto): Promise<QuestionPoolEntity> {
    if (!dto.name?.trim()) throw new Error('QUESTION_INVALID_INPUT: Pool name is required');
    if (dto.targetQuestionCount < 1) throw new Error('QUESTION_INVALID_INPUT: targetQuestionCount must be ≥ 1');

    const poolId = generateUuid();
    const now = new Date().toISOString();

    const pool: QuestionPoolEntity = {
      poolId,
      bankId: dto.bankId,
      institutionId: dto.institutionId,
      name: dto.name.trim(),
      strategy: dto.strategy || 'RANDOM',
      targetQuestionCount: dto.targetQuestionCount,
      difficultyDistribution: dto.difficultyDistribution || { EASY: 40, MEDIUM: 40, HARD: 20 },
      topicDistribution: dto.topicDistribution || {},
      excludedQuestionIds: dto.excludedQuestionIds || [],
      reusePolicy: dto.reusePolicy || 'ALLOW_ALWAYS',
      isValidated: false,
      lastValidatedAt: null,
      createdAt: now,
      updatedAt: now
    };

    await this.repository.createPool(pool);
    this.cache.invalidatePoolList(dto.bankId);
    await this.eventPublisher.publishQuestionPoolUpdated(poolId);
    return pool;
  }

  public async getPool(poolId: string): Promise<QuestionPoolEntity> {
    const cached = this.cache.getPool(poolId);
    if (cached) return cached;

    const pool = await this.repository.findPoolById(poolId);
    if (!pool) throw new Error(`QUESTION_NOT_FOUND: Pool ${poolId} not found`);

    this.cache.setPool(poolId, pool);
    return pool;
  }

  public async updatePool(poolId: string, dto: UpdateQuestionPoolDto): Promise<QuestionPoolEntity> {
    const existing = await this.getPool(poolId);

    const updates: Partial<QuestionPoolEntity> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.strategy !== undefined && { strategy: dto.strategy }),
      ...(dto.targetQuestionCount !== undefined && { targetQuestionCount: dto.targetQuestionCount }),
      ...(dto.difficultyDistribution !== undefined && { difficultyDistribution: dto.difficultyDistribution }),
      ...(dto.topicDistribution !== undefined && { topicDistribution: dto.topicDistribution }),
      ...(dto.excludedQuestionIds !== undefined && { excludedQuestionIds: dto.excludedQuestionIds }),
      ...(dto.reusePolicy !== undefined && { reusePolicy: dto.reusePolicy }),
      isValidated: false
    };

    const updated = await this.repository.updatePool(poolId, updates);
    this.cache.invalidatePool(poolId, existing.bankId);
    await this.eventPublisher.publishQuestionPoolUpdated(poolId);
    return updated;
  }

  public async listPools(bankId: string): Promise<QuestionPoolEntity[]> {
    const cached = this.cache.getPoolList(bankId);
    if (cached) return cached;

    const pools = await this.repository.listPools(bankId);
    this.cache.setPoolList(bankId, pools);
    return pools;
  }

  public async deletePool(poolId: string): Promise<void> {
    const pool = await this.getPool(poolId);
    await this.repository.deletePool(poolId);
    this.cache.invalidatePool(poolId, pool.bankId);
  }

  public async validatePool(poolId: string): Promise<PoolValidationResult> {
    const pool = await this.getPool(poolId);
    const { items } = await this.searchQuestions({
      bankId: pool.bankId,
      status: 'APPROVED'
    });

    const eligible = items.filter(q => !pool.excludedQuestionIds.includes(q.question.questionId));
    const available = eligible.length;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (available < pool.targetQuestionCount) {
      errors.push(`Pool requires ${pool.targetQuestionCount} questions but only ${available} approved questions are available`);
    }

    const difficultyBreakdown: Record<DifficultyLevel, { target: number; available: number }> = {
      EASY: { target: pool.difficultyDistribution.EASY, available: 0 },
      MEDIUM: { target: pool.difficultyDistribution.MEDIUM, available: 0 },
      HARD: { target: pool.difficultyDistribution.HARD, available: 0 }
    };

    for (const q of eligible) {
      const diff = q.question.difficulty;
      difficultyBreakdown[diff].available += 1;
    }

    for (const [level, counts] of Object.entries(difficultyBreakdown) as [DifficultyLevel, { target: number; available: number }][]) {
      if (counts.available < counts.target) {
        warnings.push(`${level}: need ${counts.target} but only ${counts.available} available`);
      }
    }

    const isValid = errors.length === 0;
    const now = new Date().toISOString();
    await this.repository.updatePool(poolId, { isValidated: isValid, lastValidatedAt: now });
    this.cache.invalidatePool(poolId, pool.bankId);

    return {
      poolId,
      isValid,
      availableCount: available,
      targetCount: pool.targetQuestionCount,
      difficultyBreakdown,
      errors,
      warnings,
      validatedAt: now
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 6. RANDOMIZATION ENGINE
  // ────────────────────────────────────────────────────────────────────────────

  public async getRandomizedQuestions(dto: RandomSelectionQueryDto): Promise<QuestionResponseDto[]> {
    const cacheKey = `rand_${dto.bankId || dto.poolId}_${dto.count}_${dto.seed ?? 'ns'}_${dto.randomizeOptions ?? false}_${dto.difficultyFilter ?? ''}`;
    const cached = this.cache.getRandomSelection(cacheKey);
    if (cached) return cached;

    // Resolve pool config
    let excludedIds: string[] = dto.excludedQuestionIds || [];
    let diffDist: Record<DifficultyLevel, number> | undefined = dto.difficultyDistribution;
    let topicDist: Record<string, number> | undefined = dto.topicDistribution;

    if (dto.poolId) {
      const pool = await this.getPool(dto.poolId);
      excludedIds = [...excludedIds, ...pool.excludedQuestionIds];
      diffDist = diffDist || pool.difficultyDistribution;
      topicDist = topicDist || pool.topicDistribution;
    }

    const { items } = await this.searchQuestions({
      bankId: dto.bankId,
      difficulty: dto.difficultyFilter,
      status: 'APPROVED',
      limit: 1000
    });

    const selected = this.randomizationEngine.selectFromPool(items, {
      targetCount: dto.count,
      excludedIds,
      difficultyDistribution: diffDist,
      topicDistribution: topicDist && Object.keys(topicDist).length > 0 ? topicDist : undefined,
      seed: dto.seed,
      randomizeOptions: dto.randomizeOptions
    });

    this.cache.setRandomSelection(cacheKey, selected);
    return selected;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 7. IMPORT / EXPORT
  // ────────────────────────────────────────────────────────────────────────────

  public async importQuestions(
    bankId: string,
    institutionId: string,
    content: string,
    format: QuestionFormat,
    actorUserId: string
  ): Promise<QuestionImportJobEntity> {
    const bank = await this.repository.findBankById(bankId);
    if (!bank) throw new Error(`QUESTION_NOT_FOUND: Question bank ${bankId} not found`);

    const { dtos, report, duplicateHashes } = this.importExportEngine.parseImportPayload(content, format);

    const jobId = generateUuid();
    const now = new Date().toISOString();
    let importedCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];
    const importReport = [...report];

    for (let i = 0; i < dtos.length; i++) {
      const dto = dtos[i];
      const rowEntry = importReport[i];
      const hash = this.importExportEngine.contentHash(dto.title, dto.body);

      // Skip intra-batch duplicates
      if (duplicateHashes.has(hash) && rowEntry.status === 'SKIPPED_DUPLICATE') {
        duplicateCount++;
        continue;
      }

      // Skip cross-batch duplicates (already in the repository)
      if (this.repository.isDuplicate(institutionId, hash)) {
        importReport[i] = { ...rowEntry, status: 'SKIPPED_DUPLICATE', reason: 'Already exists in bank' };
        duplicateCount++;
        continue;
      }

      try {
        await this.createQuestion({ ...dto, bankId, institutionId }, actorUserId);
        importedCount++;
      } catch (err: any) {
        importReport[i] = { ...rowEntry, status: 'FAILED', reason: err.message };
        errors.push(`Row ${i + 1} – "${dto.title}": ${err.message}`);
      }
    }

    const status = errors.length === 0 ? 'COMPLETED' : (importedCount > 0 ? 'COMPLETED' : 'FAILED');

    const importJob: QuestionImportJobEntity = {
      jobId,
      institutionId,
      bankId,
      format,
      status,
      totalParsed: dtos.length,
      importedCount,
      duplicateCount,
      failedCount: errors.length,
      errors,
      importReport,
      createdBy: actorUserId,
      createdAt: now,
      completedAt: new Date().toISOString()
    };

    await this.repository.createImportJob(importJob);
    await this.eventPublisher.publishQuestionImported(jobId, importedCount);

    this.auditLog('QUESTIONS_IMPORTED', `Imported ${importedCount}/${dtos.length} questions into bank ${bankId}`, {
      userId: actorUserId, institutionId, resourceId: bankId,
      metadata: { jobId, format, importedCount, duplicateCount, errors: errors.length }
    });

    return importJob;
  }

  public async exportQuestions(
    bankId: string,
    institutionId: string,
    format: QuestionFormat,
    actorUserId: string = 'system'
  ): Promise<{ jobId: string; content: string }> {
    const bank = await this.repository.findBankById(bankId);
    if (!bank) throw new Error(`QUESTION_NOT_FOUND: Question bank ${bankId} not found`);

    const { items } = await this.searchQuestions({ bankId, limit: 10000 });
    const content = this.importExportEngine.generateExportPayload(items, format);

    const jobId = generateUuid();
    const now = new Date().toISOString();
    const exportJob: QuestionExportJobEntity = {
      jobId,
      institutionId,
      bankId,
      format,
      downloadUrl: null,
      status: 'COMPLETED',
      exportedCount: items.length,
      createdBy: actorUserId,
      createdAt: now,
      completedAt: now
    };

    await this.repository.createExportJob(exportJob);
    await this.eventPublisher.publishQuestionExported(jobId, items.length);

    return { jobId, content };
  }

  public getExportTemplate(format: QuestionFormat): ExportTemplateDto {
    return this.importExportEngine.generateTemplate(format);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 8. CATEGORIES
  // ────────────────────────────────────────────────────────────────────────────

  public async createCategory(dto: CreateCategoryDto): Promise<QuestionCategoryEntity> {
    if (!dto.name?.trim()) throw new Error('QUESTION_INVALID_INPUT: Category name is required');

    const category: QuestionCategoryEntity = {
      categoryId: generateUuid(),
      institutionId: dto.institutionId,
      name: dto.name.trim(),
      description: dto.description || null,
      parentId: dto.parentId || null,
      createdAt: new Date().toISOString()
    };

    await this.repository.createCategory(category);
    this.cache.invalidateCategories(dto.institutionId);
    return category;
  }

  public async listCategories(institutionId: string): Promise<QuestionCategoryEntity[]> {
    const cached = this.cache.getCategories(institutionId);
    if (cached) return cached;

    const categories = await this.repository.listCategories(institutionId);
    this.cache.setCategories(institutionId, categories);
    return categories;
  }

  public async deleteCategory(categoryId: string, institutionId: string): Promise<void> {
    const existing = await this.repository.findCategoryById(categoryId);
    if (!existing) throw new Error(`QUESTION_NOT_FOUND: Category ${categoryId} not found`);
    await this.repository.deleteCategory(categoryId);
    this.cache.invalidateCategories(institutionId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 9. TAGS
  // ────────────────────────────────────────────────────────────────────────────

  public async createTag(dto: CreateTagDto): Promise<QuestionTagEntity> {
    if (!dto.name?.trim()) throw new Error('QUESTION_INVALID_INPUT: Tag name is required');

    const tag: QuestionTagEntity = {
      tagId: generateUuid(),
      institutionId: dto.institutionId,
      name: dto.name.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    };

    await this.repository.createTag(tag);
    this.cache.invalidateTags(dto.institutionId);
    return tag;
  }

  public async listTags(institutionId: string): Promise<QuestionTagEntity[]> {
    const cached = this.cache.getTags(institutionId);
    if (cached) return cached;

    const tags = await this.repository.listTags(institutionId);
    this.cache.setTags(institutionId, tags);
    return tags;
  }

  public async deleteTag(tagId: string, institutionId: string): Promise<void> {
    const existing = await this.repository.findTagById(tagId);
    if (!existing) throw new Error(`QUESTION_NOT_FOUND: Tag ${tagId} not found`);
    await this.repository.deleteTag(tagId);
    this.cache.invalidateTags(institutionId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 10. ANALYTICS
  // ────────────────────────────────────────────────────────────────────────────

  public async recordAttempt(dto: RecordAttemptDto): Promise<QuestionAnalyticsEntity> {
    const question = await this.repository.findQuestionById(dto.questionId);
    if (!question) throw new Error(`QUESTION_NOT_FOUND: Question ${dto.questionId} not found`);

    const existing = await this.repository.getAnalytics(dto.questionId);
    const updated = this.analyticsEngine.applyAttempt(dto, existing);
    await this.repository.upsertAnalytics(updated);
    this.cache.invalidateAnalytics(dto.questionId);
    return updated;
  }

  public async getAnalytics(questionId: string): Promise<QuestionAnalyticsEntity | null> {
    const cached = this.cache.getAnalytics(questionId);
    if (cached) return cached;

    const analytics = await this.repository.getAnalytics(questionId);
    if (analytics) this.cache.setAnalytics(questionId, analytics);
    return analytics;
  }

  public async getBankAnalyticsSummary(bankId: string, institutionId: string): Promise<{
    totalAttempts: number;
    avgDifficultyIndex: number;
    avgDiscriminationIndex: number;
    avgResponseTimeSeconds: number;
    questionCount: number;
  }> {
    const entities = await this.repository.listAnalyticsForBank(bankId, institutionId);
    return this.analyticsEngine.summariseBankAnalytics(entities);
  }
}
