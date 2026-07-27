import {
  DraftAnswerEntity,
  SubmissionAnalyticsDto,
  SubmissionAnswerEntity,
  SubmissionEntity,
  SubmissionFileEntity
} from '../types/submission';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SubmissionCache {
  private readonly ttlMs: number;

  private readonly submissionById = new Map<string, CacheEntry<SubmissionEntity>>();
  private readonly submissionBySession = new Map<string, CacheEntry<string>>();
  private readonly submissionByCandidateExam = new Map<string, CacheEntry<string>>();
  private readonly submissionListByExam = new Map<string, CacheEntry<SubmissionEntity[]>>();
  private readonly answerMap = new Map<string, CacheEntry<SubmissionAnswerEntity>>(); // submissionId:questionId → Answer
  private readonly draftMap = new Map<string, CacheEntry<DraftAnswerEntity>>();       // submissionId:questionId → Draft
  private readonly fileMap = new Map<string, CacheEntry<SubmissionFileEntity>>();       // fileId → File
  private readonly analyticsMap = new Map<string, CacheEntry<SubmissionAnalyticsDto>>();

  constructor(ttlSeconds: number = 300) {
    this.ttlMs = ttlSeconds * 1000;
  }

  private set<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs?: number): void {
    map.set(key, { value, expiresAt: Date.now() + (ttlMs ?? this.ttlMs) });
  }

  private get<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      map.delete(key);
      return null;
    }
    return entry.value;
  }

  private delete<T>(map: Map<string, CacheEntry<T>>, key: string): void {
    map.delete(key);
  }

  // ── Submission Cache ────────────────────────────────────────────────────────

  public setSubmission(submission: SubmissionEntity): void {
    this.set(this.submissionById, submission.submissionId, submission);
    this.set(this.submissionBySession, submission.sessionId, submission.submissionId);
    this.set(this.submissionByCandidateExam, `${submission.candidateId}:${submission.examId}`, submission.submissionId);
  }

  public getSubmission(submissionId: string): SubmissionEntity | null {
    return this.get(this.submissionById, submissionId);
  }

  public getSubmissionIdBySession(sessionId: string): string | null {
    return this.get(this.submissionBySession, sessionId);
  }

  public getSubmissionIdByCandidateExam(candidateId: string, examId: string): string | null {
    return this.get(this.submissionByCandidateExam, `${candidateId}:${examId}`);
  }

  public invalidateSubmission(submissionId: string, sessionId?: string, candidateId?: string, examId?: string): void {
    this.delete(this.submissionById, submissionId);
    if (sessionId) this.delete(this.submissionBySession, sessionId);
    if (candidateId && examId) this.delete(this.submissionByCandidateExam, `${candidateId}:${examId}`);
    if (examId) this.delete(this.submissionListByExam, examId);
  }

  public setSubmissionListByExam(examId: string, list: SubmissionEntity[]): void {
    this.set(this.submissionListByExam, examId, list);
  }

  public getSubmissionListByExam(examId: string): SubmissionEntity[] | null {
    return this.get(this.submissionListByExam, examId);
  }

  // ── Answer Cache ─────────────────────────────────────────────────────────────

  public setAnswer(answer: SubmissionAnswerEntity): void {
    this.set(this.answerMap, `${answer.submissionId}:${answer.questionId}`, answer);
  }

  public getAnswer(submissionId: string, questionId: string): SubmissionAnswerEntity | null {
    return this.get(this.answerMap, `${submissionId}:${questionId}`);
  }

  public invalidateAnswer(submissionId: string, questionId: string): void {
    this.delete(this.answerMap, `${submissionId}:${questionId}`);
  }

  // ── Draft Cache ──────────────────────────────────────────────────────────────

  public setDraft(draft: DraftAnswerEntity): void {
    this.set(this.draftMap, `${draft.submissionId}:${draft.questionId}`, draft);
  }

  public getDraft(submissionId: string, questionId: string): DraftAnswerEntity | null {
    return this.get(this.draftMap, `${submissionId}:${questionId}`);
  }

  public invalidateDraft(submissionId: string, questionId: string): void {
    this.delete(this.draftMap, `${submissionId}:${questionId}`);
  }

  // ── File Cache ───────────────────────────────────────────────────────────────

  public setFile(file: SubmissionFileEntity): void {
    this.set(this.fileMap, file.fileId, file);
  }

  public getFile(fileId: string): SubmissionFileEntity | null {
    return this.get(this.fileMap, fileId);
  }

  public invalidateFile(fileId: string): void {
    this.delete(this.fileMap, fileId);
  }

  // ── Analytics Cache ──────────────────────────────────────────────────────────

  public setAnalytics(submissionId: string, analytics: SubmissionAnalyticsDto): void {
    this.set(this.analyticsMap, submissionId, analytics);
  }

  public getAnalytics(submissionId: string): SubmissionAnalyticsDto | null {
    return this.get(this.analyticsMap, submissionId);
  }

  public invalidateAnalytics(submissionId: string): void {
    this.delete(this.analyticsMap, submissionId);
  }

  // ── Clear All ────────────────────────────────────────────────────────────────

  public invalidateAll(submissionId: string): void {
    this.invalidateSubmission(submissionId);
    this.invalidateAnalytics(submissionId);
    for (const k of Array.from(this.answerMap.keys())) {
      if (k.startsWith(`${submissionId}:`)) this.answerMap.delete(k);
    }
    for (const k of Array.from(this.draftMap.keys())) {
      if (k.startsWith(`${submissionId}:`)) this.draftMap.delete(k);
    }
  }
}
