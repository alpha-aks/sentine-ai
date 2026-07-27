import {
  DifficultyLevel,
  ImportReportEntry,
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
  QuestionSearchQueryDto,
  QuestionTagEntity,
  QuestionVersionEntity
} from '../types/question';

export class QuestionRepository {
  // ── Primary stores ──────────────────────────────────────────────────────────
  private questions: Map<string, QuestionEntity> = new Map();
  private versions: Map<string, QuestionVersionEntity[]> = new Map();        // questionId → []
  private options: Map<string, QuestionOptionEntity[]> = new Map();          // questionId → []
  private attachments: Map<string, QuestionAttachmentEntity[]> = new Map();  // questionId → []

  // ── Bank & Pool stores ──────────────────────────────────────────────────────
  private banks: Map<string, QuestionBankEntity> = new Map();
  private pools: Map<string, QuestionPoolEntity> = new Map();

  // ── Taxonomy stores ─────────────────────────────────────────────────────────
  private categories: Map<string, QuestionCategoryEntity> = new Map();
  private tags: Map<string, QuestionTagEntity> = new Map();

  // ── Job stores ──────────────────────────────────────────────────────────────
  private importJobs: Map<string, QuestionImportJobEntity> = new Map();
  private exportJobs: Map<string, QuestionExportJobEntity> = new Map();

  // ── Analytics ───────────────────────────────────────────────────────────────
  private analytics: Map<string, QuestionAnalyticsEntity> = new Map(); // questionId → entity

  // ── Content-hash deduplication index ────────────────────────────────────────
  private contentHashes: Map<string, string> = new Map(); // `${institutionId}:${hash}` → questionId

  // ────────────────────────────────────────────────────────────────────────────
  // QUESTIONS
  // ────────────────────────────────────────────────────────────────────────────

  public async createQuestion(
    entity: QuestionEntity,
    optionList: QuestionOptionEntity[] = [],
    skipDuplicateCheck: boolean = false
  ): Promise<QuestionEntity> {
    const hashKey = `${entity.institutionId}:${entity.contentHash}`;
    if (!skipDuplicateCheck && this.contentHashes.has(hashKey)) {
      throw new Error(`QUESTION_DUPLICATE: A question with identical content already exists (hash=${entity.contentHash})`);
    }
    this.questions.set(entity.questionId, { ...entity });
    this.options.set(entity.questionId, optionList.map(o => ({ ...o })));
    this.contentHashes.set(hashKey, entity.questionId);

    // Seed version 1
    const firstVersion: QuestionVersionEntity = {
      versionId: `ver_${entity.questionId}_1`,
      questionId: entity.questionId,
      version: 1,
      title: entity.title,
      body: entity.body,
      options: optionList.map(o => ({ ...o })),
      changeSummary: 'Initial creation',
      authorId: entity.createdById,
      snapshotData: { ...entity },
      createdAt: entity.createdAt
    };
    this.versions.set(entity.questionId, [firstVersion]);

    // Increment bank question count
    const bank = this.banks.get(entity.bankId);
    if (bank) {
      bank.questionCount += 1;
      this.banks.set(entity.bankId, bank);
    }

    return { ...entity };
  }

  public async findQuestionById(questionId: string): Promise<QuestionEntity | null> {
    const q = this.questions.get(questionId);
    return q ? { ...q } : null;
  }

  public async updateQuestion(
    questionId: string,
    updates: Partial<QuestionEntity>,
    optionList?: QuestionOptionEntity[],
    changeSummary: string = 'Updated question',
    authorId: string = 'system'
  ): Promise<QuestionEntity> {
    const existing = this.questions.get(questionId);
    if (!existing) throw new Error(`Question ${questionId} not found`);

    // If content hash changed, update dedup index
    if (updates.contentHash && updates.contentHash !== existing.contentHash) {
      const oldKey = `${existing.institutionId}:${existing.contentHash}`;
      const newKey = `${existing.institutionId}:${updates.contentHash}`;
      this.contentHashes.delete(oldKey);
      // Check for collision
      if (this.contentHashes.has(newKey)) {
        throw new Error(`QUESTION_DUPLICATE: A question with identical content already exists`);
      }
      this.contentHashes.set(newKey, questionId);
    }

    const newVersionNum = existing.version + 1;
    const updated: QuestionEntity = {
      ...existing,
      ...updates,
      version: newVersionNum,
      updatedAt: new Date().toISOString()
    };

    if (optionList !== undefined) {
      this.options.set(questionId, optionList.map(o => ({ ...o })));
    }
    const currentOpts = this.options.get(questionId) || [];

    // Append version snapshot
    const verList = this.versions.get(questionId) || [];
    verList.push({
      versionId: `ver_${questionId}_${newVersionNum}`,
      questionId,
      version: newVersionNum,
      title: updated.title,
      body: updated.body,
      options: currentOpts.map(o => ({ ...o })),
      changeSummary,
      authorId,
      snapshotData: { ...updated },
      createdAt: updated.updatedAt
    });
    this.versions.set(questionId, verList);
    this.questions.set(questionId, updated);
    return { ...updated };
  }

  public async deleteQuestion(questionId: string): Promise<void> {
    const existing = this.questions.get(questionId);
    if (existing) {
      // Remove dedup entry
      const hashKey = `${existing.institutionId}:${existing.contentHash}`;
      this.contentHashes.delete(hashKey);

      // Decrement bank count
      const bank = this.banks.get(existing.bankId);
      if (bank && bank.questionCount > 0) {
        bank.questionCount -= 1;
        this.banks.set(existing.bankId, bank);
      }
    }
    this.questions.delete(questionId);
    this.options.delete(questionId);
    this.versions.delete(questionId);
    this.attachments.delete(questionId);
  }

  public async searchQuestions(
    queryDto: QuestionSearchQueryDto
  ): Promise<{ items: QuestionEntity[]; total: number }> {
    let results = Array.from(this.questions.values());

    if (queryDto.institutionId) results = results.filter(q => q.institutionId === queryDto.institutionId);
    if (queryDto.bankId) results = results.filter(q => q.bankId === queryDto.bankId);
    if (queryDto.type) results = results.filter(q => q.type === queryDto.type);
    if (queryDto.difficulty) results = results.filter(q => q.difficulty === queryDto.difficulty);
    if (queryDto.status) results = results.filter(q => q.status === queryDto.status);
    if (queryDto.categoryId) results = results.filter(q => q.categoryId === queryDto.categoryId);
    if (queryDto.tag) results = results.filter(q => q.tags.includes(queryDto.tag!));
    if (queryDto.query) {
      const q = queryDto.query.toLowerCase().trim();
      results = results.filter(
        item => item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q)
      );
    }

    const total = results.length;
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.max(1, Math.min(100, queryDto.limit || 20));
    const startIndex = (page - 1) * limit;
    const items = results.slice(startIndex, startIndex + limit).map(q => ({ ...q }));
    return { items, total };
  }

  public async getOptions(questionId: string): Promise<QuestionOptionEntity[]> {
    return (this.options.get(questionId) || []).map(o => ({ ...o }));
  }

  public async getVersions(questionId: string): Promise<QuestionVersionEntity[]> {
    return (this.versions.get(questionId) || []).map(v => ({ ...v }));
  }

  public async getVersionByNumber(questionId: string, versionNum: number): Promise<QuestionVersionEntity | null> {
    const versions = this.versions.get(questionId) || [];
    const found = versions.find(v => v.version === versionNum);
    return found ? { ...found } : null;
  }

  public async getAttachments(questionId: string): Promise<QuestionAttachmentEntity[]> {
    return (this.attachments.get(questionId) || []).map(a => ({ ...a }));
  }

  public async addAttachment(attachment: QuestionAttachmentEntity): Promise<QuestionAttachmentEntity> {
    const existing = this.attachments.get(attachment.questionId) || [];
    existing.push({ ...attachment });
    this.attachments.set(attachment.questionId, existing);
    return { ...attachment };
  }

  public async deleteAttachment(questionId: string, attachmentId: string): Promise<void> {
    const existing = this.attachments.get(questionId) || [];
    this.attachments.set(questionId, existing.filter(a => a.attachmentId !== attachmentId));
  }

  public isDuplicate(institutionId: string, contentHash: string): boolean {
    return this.contentHashes.has(`${institutionId}:${contentHash}`);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // QUESTION BANKS
  // ────────────────────────────────────────────────────────────────────────────

  public async createBank(entity: QuestionBankEntity): Promise<QuestionBankEntity> {
    this.banks.set(entity.bankId, { ...entity });
    return { ...entity };
  }

  public async findBankById(bankId: string): Promise<QuestionBankEntity | null> {
    const b = this.banks.get(bankId);
    return b ? { ...b } : null;
  }

  public async updateBank(bankId: string, updates: Partial<QuestionBankEntity>): Promise<QuestionBankEntity> {
    const existing = this.banks.get(bankId);
    if (!existing) throw new Error(`Question bank ${bankId} not found`);
    const updated: QuestionBankEntity = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.banks.set(bankId, updated);
    return { ...updated };
  }

  public async listBanks(institutionId: string, includeArchived: boolean = false): Promise<QuestionBankEntity[]> {
    return Array.from(this.banks.values())
      .filter(b => b.institutionId === institutionId && (includeArchived || !b.isArchived))
      .map(b => ({ ...b }));
  }

  public async archiveBank(bankId: string): Promise<QuestionBankEntity> {
    return this.updateBank(bankId, { isArchived: true });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // QUESTION POOLS
  // ────────────────────────────────────────────────────────────────────────────

  public async createPool(entity: QuestionPoolEntity): Promise<QuestionPoolEntity> {
    this.pools.set(entity.poolId, { ...entity });
    return { ...entity };
  }

  public async findPoolById(poolId: string): Promise<QuestionPoolEntity | null> {
    const p = this.pools.get(poolId);
    return p ? { ...p } : null;
  }

  public async updatePool(poolId: string, updates: Partial<QuestionPoolEntity>): Promise<QuestionPoolEntity> {
    const existing = this.pools.get(poolId);
    if (!existing) throw new Error(`Question pool ${poolId} not found`);
    const updated: QuestionPoolEntity = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.pools.set(poolId, updated);
    return { ...updated };
  }

  public async listPools(bankId: string): Promise<QuestionPoolEntity[]> {
    return Array.from(this.pools.values())
      .filter(p => p.bankId === bankId)
      .map(p => ({ ...p }));
  }

  public async deletePool(poolId: string): Promise<void> {
    this.pools.delete(poolId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ────────────────────────────────────────────────────────────────────────────

  public async createCategory(entity: QuestionCategoryEntity): Promise<QuestionCategoryEntity> {
    this.categories.set(entity.categoryId, { ...entity });
    return { ...entity };
  }

  public async findCategoryById(categoryId: string): Promise<QuestionCategoryEntity | null> {
    const c = this.categories.get(categoryId);
    return c ? { ...c } : null;
  }

  public async listCategories(institutionId: string): Promise<QuestionCategoryEntity[]> {
    return Array.from(this.categories.values())
      .filter(c => c.institutionId === institutionId)
      .map(c => ({ ...c }));
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    this.categories.delete(categoryId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TAGS
  // ────────────────────────────────────────────────────────────────────────────

  public async createTag(entity: QuestionTagEntity): Promise<QuestionTagEntity> {
    this.tags.set(entity.tagId, { ...entity });
    return { ...entity };
  }

  public async findTagById(tagId: string): Promise<QuestionTagEntity | null> {
    const t = this.tags.get(tagId);
    return t ? { ...t } : null;
  }

  public async listTags(institutionId: string): Promise<QuestionTagEntity[]> {
    return Array.from(this.tags.values())
      .filter(t => t.institutionId === institutionId)
      .map(t => ({ ...t }));
  }

  public async deleteTag(tagId: string): Promise<void> {
    this.tags.delete(tagId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ────────────────────────────────────────────────────────────────────────────

  public async getAnalytics(questionId: string): Promise<QuestionAnalyticsEntity | null> {
    const a = this.analytics.get(questionId);
    return a ? { ...a } : null;
  }

  public async upsertAnalytics(entity: QuestionAnalyticsEntity): Promise<QuestionAnalyticsEntity> {
    this.analytics.set(entity.questionId, { ...entity });
    return { ...entity };
  }

  public async listAnalyticsForBank(bankId: string, institutionId: string): Promise<QuestionAnalyticsEntity[]> {
    const questionIds = Array.from(this.questions.values())
      .filter(q => q.bankId === bankId && q.institutionId === institutionId)
      .map(q => q.questionId);
    return questionIds
      .map(id => this.analytics.get(id))
      .filter((a): a is QuestionAnalyticsEntity => !!a)
      .map(a => ({ ...a }));
  }

  // ────────────────────────────────────────────────────────────────────────────
  // IMPORT / EXPORT JOBS
  // ────────────────────────────────────────────────────────────────────────────

  public async createImportJob(entity: QuestionImportJobEntity): Promise<QuestionImportJobEntity> {
    this.importJobs.set(entity.jobId, { ...entity });
    return { ...entity };
  }

  public async updateImportJob(
    jobId: string,
    updates: Partial<QuestionImportJobEntity>
  ): Promise<QuestionImportJobEntity> {
    const existing = this.importJobs.get(jobId);
    if (!existing) throw new Error(`Import job ${jobId} not found`);
    const updated = { ...existing, ...updates };
    this.importJobs.set(jobId, updated);
    return { ...updated };
  }

  public async getImportJob(jobId: string): Promise<QuestionImportJobEntity | null> {
    const j = this.importJobs.get(jobId);
    return j ? { ...j } : null;
  }

  public async createExportJob(entity: QuestionExportJobEntity): Promise<QuestionExportJobEntity> {
    this.exportJobs.set(entity.jobId, { ...entity });
    return { ...entity };
  }

  public async getExportJob(jobId: string): Promise<QuestionExportJobEntity | null> {
    const j = this.exportJobs.get(jobId);
    return j ? { ...j } : null;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // UTILITY
  // ────────────────────────────────────────────────────────────────────────────

  public clear(): void {
    this.questions.clear();
    this.versions.clear();
    this.options.clear();
    this.attachments.clear();
    this.banks.clear();
    this.pools.clear();
    this.categories.clear();
    this.tags.clear();
    this.importJobs.clear();
    this.exportJobs.clear();
    this.analytics.clear();
    this.contentHashes.clear();
  }
}
