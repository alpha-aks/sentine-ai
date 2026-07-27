import {
  ExamEligibilityEntity,
  ExamEntity,
  ExamPolicyEntity,
  ExamResponseDto,
  ExamRuleEntity,
  ExamScheduleEntity
} from '../types/exam';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class ExamCache {
  private examCache: Map<string, CacheEntry<ExamResponseDto>> = new Map();
  private ruleCache: Map<string, CacheEntry<ExamRuleEntity>> = new Map();
  private policyCache: Map<string, CacheEntry<ExamPolicyEntity>> = new Map();
  private scheduleCache: Map<string, CacheEntry<ExamScheduleEntity>> = new Map();
  private eligibilityCache: Map<string, CacheEntry<ExamEligibilityEntity>> = new Map();
  private readonly defaultTtlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.defaultTtlMs = ttlSeconds * 1000;
  }

  // --- Exam Response Cache ---
  public getExam(examId: string): ExamResponseDto | null {
    const entry = this.examCache.get(examId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.examCache.delete(examId);
      return null;
    }
    return { ...entry.data };
  }

  public setExam(examId: string, response: ExamResponseDto): void {
    this.examCache.set(examId, {
      data: { ...response },
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateExam(examId: string): void {
    this.examCache.delete(examId);
  }

  // --- Exam Rules Cache ---
  public getRules(examId: string): ExamRuleEntity | null {
    const entry = this.ruleCache.get(examId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.ruleCache.delete(examId);
      return null;
    }
    return { ...entry.data };
  }

  public setRules(examId: string, rules: ExamRuleEntity): void {
    this.ruleCache.set(examId, {
      data: { ...rules },
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateRules(examId: string): void {
    this.ruleCache.delete(examId);
  }

  // --- Exam Schedule Cache ---
  public getSchedule(examId: string): ExamScheduleEntity | null {
    const entry = this.scheduleCache.get(examId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.scheduleCache.delete(examId);
      return null;
    }
    return { ...entry.data };
  }

  public setSchedule(examId: string, schedule: ExamScheduleEntity): void {
    this.scheduleCache.set(examId, {
      data: { ...schedule },
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateSchedule(examId: string): void {
    this.scheduleCache.delete(examId);
  }

  // --- Exam Eligibility Cache ---
  public getEligibility(examId: string): ExamEligibilityEntity | null {
    const entry = this.eligibilityCache.get(examId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.eligibilityCache.delete(examId);
      return null;
    }
    return { ...entry.data };
  }

  public setEligibility(examId: string, eligibility: ExamEligibilityEntity): void {
    this.eligibilityCache.set(examId, {
      data: { ...eligibility },
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateEligibility(examId: string): void {
    this.eligibilityCache.delete(examId);
  }

  public invalidateAll(examId: string): void {
    this.invalidateExam(examId);
    this.invalidateRules(examId);
    this.invalidateSchedule(examId);
    this.invalidateEligibility(examId);
    this.policyCache.delete(examId);
  }

  public clear(): void {
    this.examCache.clear();
    this.ruleCache.clear();
    this.policyCache.clear();
    this.scheduleCache.clear();
    this.eligibilityCache.clear();
  }
}
