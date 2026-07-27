import { generateUuid } from '@sentinel-ai/utils';
import {
  AnswerVersionEntity,
  DraftAnswerEntity,
  SubmissionAnswerEntity,
  SubmissionAuditEntity,
  SubmissionEntity,
  SubmissionEventEntity,
  SubmissionFileEntity,
  SubmissionHistoryEntity,
  SubmissionMetadataEntity,
  SubmissionStatus
} from '../types/submission';

export class SubmissionRepository {
  // ── Primary Stores ──────────────────────────────────────────────────────────
  private readonly submissions = new Map<string, SubmissionEntity>();
  private readonly answers = new Map<string, SubmissionAnswerEntity>();          // submissionId:questionId → Answer
  private readonly versions = new Map<string, AnswerVersionEntity[]>();          // submissionId:questionId → Version[]
  private readonly drafts = new Map<string, DraftAnswerEntity>();                // submissionId:questionId → Draft
  private readonly files = new Map<string, SubmissionFileEntity>();                // fileId → File
  private readonly histories = new Map<string, SubmissionHistoryEntity[]>();      // submissionId → History[]
  private readonly audits = new Map<string, SubmissionAuditEntity[]>();          // submissionId → Audit[]
  private readonly events = new Map<string, SubmissionEventEntity[]>();          // submissionId → Event[]
  private readonly metadatas = new Map<string, SubmissionMetadataEntity>();      // submissionId → Metadata

  // ── Secondary Indexes ───────────────────────────────────────────────────────
  private readonly submissionBySession = new Map<string, string>();               // sessionId → submissionId
  private readonly submissionsByExam = new Map<string, Set<string>>();           // examId → Set<submissionId>
  private readonly submissionsByCandidate = new Map<string, string>();            // candidateId:examId → submissionId
  private readonly submissionsByInstitution = new Map<string, Set<string>>();    // institutionId → Set<submissionId>
  private readonly filesBySubmission = new Map<string, Set<string>>();           // submissionId → Set<fileId>
  private readonly filesByAnswer = new Map<string, Set<string>>();               // answerId → Set<fileId>
  private readonly fileHashes = new Map<string, string>();                      // contentHash → fileId

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBMISSIONS
  // ─────────────────────────────────────────────────────────────────────────────

  public async createSubmission(entity: SubmissionEntity): Promise<SubmissionEntity> {
    this.submissions.set(entity.submissionId, { ...entity });
    this.submissionBySession.set(entity.sessionId, entity.submissionId);

    const candExamKey = `${entity.candidateId}:${entity.examId}`;
    this.submissionsByCandidate.set(candExamKey, entity.submissionId);

    if (!this.submissionsByExam.has(entity.examId)) {
      this.submissionsByExam.set(entity.examId, new Set<string>());
    }
    this.submissionsByExam.get(entity.examId)!.add(entity.submissionId);

    if (!this.submissionsByInstitution.has(entity.institutionId)) {
      this.submissionsByInstitution.set(entity.institutionId, new Set<string>());
    }
    this.submissionsByInstitution.get(entity.institutionId)!.add(entity.submissionId);

    return { ...entity };
  }

  public async findSubmissionById(submissionId: string): Promise<SubmissionEntity | null> {
    const s = this.submissions.get(submissionId);
    return s ? { ...s } : null;
  }

  public async findSubmissionBySessionId(sessionId: string): Promise<SubmissionEntity | null> {
    const id = this.submissionBySession.get(sessionId);
    if (!id) return null;
    return this.findSubmissionById(id);
  }

  public async findSubmissionByCandidateAndExam(
    candidateId: string,
    examId: string
  ): Promise<SubmissionEntity | null> {
    const id = this.submissionsByCandidate.get(`${candidateId}:${examId}`);
    if (!id) return null;
    return this.findSubmissionById(id);
  }

  public async updateSubmission(
    submissionId: string,
    updates: Partial<SubmissionEntity>
  ): Promise<SubmissionEntity | null> {
    const existing = this.submissions.get(submissionId);
    if (!existing) return null;

    const updated: SubmissionEntity = {
      ...existing,
      ...updates,
      submissionId,
      updatedAt: new Date().toISOString()
    };
    this.submissions.set(submissionId, updated);
    return { ...updated };
  }

  public async findSubmissionsByExam(
    examId: string,
    statusFilter?: SubmissionStatus
  ): Promise<SubmissionEntity[]> {
    const ids = this.submissionsByExam.get(examId) || new Set<string>();
    const results: SubmissionEntity[] = [];
    for (const id of ids) {
      const s = this.submissions.get(id);
      if (s && (!statusFilter || s.status === statusFilter)) {
        results.push({ ...s });
      }
    }
    return results;
  }

  public async findSubmissionsByInstitution(
    institutionId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ items: SubmissionEntity[]; total: number }> {
    const ids = Array.from(this.submissionsByInstitution.get(institutionId) || new Set<string>());
    const total = ids.length;
    const items = ids
      .slice((page - 1) * limit, page * limit)
      .map(id => this.submissions.get(id))
      .filter((s): s is SubmissionEntity => s !== undefined)
      .map(s => ({ ...s }));
    return { items, total };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ANSWERS
  // ─────────────────────────────────────────────────────────────────────────────

  public async saveAnswer(answer: SubmissionAnswerEntity): Promise<SubmissionAnswerEntity> {
    const key = `${answer.submissionId}:${answer.questionId}`;
    this.answers.set(key, { ...answer });

    // Update parent submission answered count & lastSavedAt
    const submission = this.submissions.get(answer.submissionId);
    if (submission) {
      const allAnswers = await this.getAnswersBySubmission(answer.submissionId);
      const answeredCount = allAnswers.filter(a => !a.isDraft || a.answerData !== null).length;
      const flaggedCount = allAnswers.filter(a => a.isFlagged).length;

      this.submissions.set(answer.submissionId, {
        ...submission,
        answeredCount,
        flaggedCount,
        lastSavedAt: answer.lastSavedAt,
        version: submission.version + 1,
        updatedAt: new Date().toISOString()
      });
    }

    return { ...answer };
  }

  public async findAnswer(
    submissionId: string,
    questionId: string
  ): Promise<SubmissionAnswerEntity | null> {
    const a = this.answers.get(`${submissionId}:${questionId}`);
    return a ? { ...a } : null;
  }

  public async getAnswersBySubmission(submissionId: string): Promise<SubmissionAnswerEntity[]> {
    const prefix = `${submissionId}:`;
    const results: SubmissionAnswerEntity[] = [];
    for (const [k, answer] of this.answers.entries()) {
      if (k.startsWith(prefix)) {
        results.push({ ...answer });
      }
    }
    return results;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DRAFTS
  // ─────────────────────────────────────────────────────────────────────────────

  public async saveDraft(draft: DraftAnswerEntity): Promise<DraftAnswerEntity> {
    const key = `${draft.submissionId}:${draft.questionId}`;
    this.drafts.set(key, { ...draft });
    return { ...draft };
  }

  public async findDraft(
    submissionId: string,
    questionId: string
  ): Promise<DraftAnswerEntity | null> {
    const d = this.drafts.get(`${submissionId}:${questionId}`);
    return d ? { ...d } : null;
  }

  public async getDraftsBySubmission(submissionId: string): Promise<DraftAnswerEntity[]> {
    const prefix = `${submissionId}:`;
    const results: DraftAnswerEntity[] = [];
    for (const [k, draft] of this.drafts.entries()) {
      if (k.startsWith(prefix)) {
        results.push({ ...draft });
      }
    }
    return results;
  }

  public async clearDraft(submissionId: string, questionId: string): Promise<void> {
    this.drafts.delete(`${submissionId}:${questionId}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VERSIONS
  // ─────────────────────────────────────────────────────────────────────────────

  public async appendAnswerVersion(version: AnswerVersionEntity): Promise<AnswerVersionEntity> {
    const key = `${version.submissionId}:${version.questionId}`;
    if (!this.versions.has(key)) {
      this.versions.set(key, []);
    }
    this.versions.get(key)!.push({ ...version });
    return { ...version };
  }

  public async getAnswerVersions(
    submissionId: string,
    questionId: string
  ): Promise<AnswerVersionEntity[]> {
    const list = this.versions.get(`${submissionId}:${questionId}`) || [];
    return list.map(v => ({ ...v }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FILES
  // ─────────────────────────────────────────────────────────────────────────────

  public async saveFile(file: SubmissionFileEntity): Promise<SubmissionFileEntity> {
    this.files.set(file.fileId, { ...file });
    this.fileHashes.set(file.contentHash, file.fileId);

    if (!this.filesBySubmission.has(file.submissionId)) {
      this.filesBySubmission.set(file.submissionId, new Set<string>());
    }
    this.filesBySubmission.get(file.submissionId)!.add(file.fileId);

    if (file.answerId) {
      if (!this.filesByAnswer.has(file.answerId)) {
        this.filesByAnswer.set(file.answerId, new Set<string>());
      }
      this.filesByAnswer.get(file.answerId)!.add(file.fileId);
    }

    return { ...file };
  }

  public async findFileById(fileId: string): Promise<SubmissionFileEntity | null> {
    const f = this.files.get(fileId);
    return f ? { ...f } : null;
  }

  public async findFileByHash(contentHash: string): Promise<SubmissionFileEntity | null> {
    const fileId = this.fileHashes.get(contentHash);
    if (!fileId) return null;
    return this.findFileById(fileId);
  }

  public async getFilesBySubmission(submissionId: string): Promise<SubmissionFileEntity[]> {
    const ids = this.filesBySubmission.get(submissionId) || new Set<string>();
    const results: SubmissionFileEntity[] = [];
    for (const id of ids) {
      const f = this.files.get(id);
      if (f) results.push({ ...f });
    }
    return results;
  }

  public async getFilesByAnswer(answerId: string): Promise<SubmissionFileEntity[]> {
    const ids = this.filesByAnswer.get(answerId) || new Set<string>();
    const results: SubmissionFileEntity[] = [];
    for (const id of ids) {
      const f = this.files.get(id);
      if (f) results.push({ ...f });
    }
    return results;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HISTORY & AUDIT & METADATA
  // ─────────────────────────────────────────────────────────────────────────────

  public async appendHistory(entity: SubmissionHistoryEntity): Promise<void> {
    if (!this.histories.has(entity.submissionId)) {
      this.histories.set(entity.submissionId, []);
    }
    this.histories.get(entity.submissionId)!.push({ ...entity });
  }

  public async getHistory(submissionId: string): Promise<SubmissionHistoryEntity[]> {
    return (this.histories.get(submissionId) || []).map(h => ({ ...h }));
  }

  public async appendAudit(entity: SubmissionAuditEntity): Promise<void> {
    if (!this.audits.has(entity.submissionId)) {
      this.audits.set(entity.submissionId, []);
    }
    this.audits.get(entity.submissionId)!.push({ ...entity });
  }

  public async getAudits(submissionId: string): Promise<SubmissionAuditEntity[]> {
    return (this.audits.get(submissionId) || []).map(a => ({ ...a }));
  }

  public async appendEvent(entity: SubmissionEventEntity): Promise<void> {
    if (!this.events.has(entity.submissionId)) {
      this.events.set(entity.submissionId, []);
    }
    this.events.get(entity.submissionId)!.push({ ...entity });
  }

  public async getEvents(submissionId: string): Promise<SubmissionEventEntity[]> {
    return (this.events.get(submissionId) || []).map(e => ({ ...e }));
  }

  public async getAllAnswerVersions(submissionId: string): Promise<AnswerVersionEntity[]> {
    const results: AnswerVersionEntity[] = [];
    const prefix = `${submissionId}:`;
    for (const [key, vList] of this.versions.entries()) {
      if (key.startsWith(prefix)) {
        results.push(...vList.map(v => ({ ...v })));
      }
    }
    return results;
  }

  public async upsertMetadata(entity: SubmissionMetadataEntity): Promise<void> {
    this.metadatas.set(entity.submissionId, { ...entity });
  }

  public async getMetadata(submissionId: string): Promise<SubmissionMetadataEntity | null> {
    const m = this.metadatas.get(submissionId);
    return m ? { ...m } : null;
  }

  public generateId(prefix: string = ''): string {
    return prefix ? `${prefix}_${generateUuid()}` : generateUuid();
  }
}
