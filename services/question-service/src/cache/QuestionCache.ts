import {
  DifficultyLevel,
  QuestionAnalyticsEntity,
  QuestionBankEntity,
  QuestionCategoryEntity,
  QuestionPoolEntity,
  QuestionResponseDto,
  QuestionTagEntity
} from '../types/question';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class QuestionCache {
  private questionCache: Map<string, CacheEntry<QuestionResponseDto>> = new Map();
  private bankCache: Map<string, CacheEntry<QuestionBankEntity>> = new Map();
  private bankListCache: Map<string, CacheEntry<QuestionBankEntity[]>> = new Map(); // institutionId → []
  private poolCache: Map<string, CacheEntry<QuestionPoolEntity>> = new Map();
  private poolListCache: Map<string, CacheEntry<QuestionPoolEntity[]>> = new Map(); // bankId → []
  private categoryCache: Map<string, CacheEntry<QuestionCategoryEntity[]>> = new Map(); // institutionId → []
  private tagCache: Map<string, CacheEntry<QuestionTagEntity[]>> = new Map(); // institutionId → []
  private analyticsCache: Map<string, CacheEntry<QuestionAnalyticsEntity>> = new Map(); // questionId → entity
  private randomCache: Map<string, CacheEntry<QuestionResponseDto[]>> = new Map();
  private readonly defaultTtlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.defaultTtlMs = ttlSeconds * 1000;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private get<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      map.delete(key);
      return null;
    }
    return entry.data;
  }

  private set<T>(map: Map<string, CacheEntry<T>>, key: string, data: T, ttlMs?: number): void {
    map.set(key, { data, expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs) });
  }

  // ── Questions ────────────────────────────────────────────────────────────────

  public getQuestion(questionId: string): QuestionResponseDto | null {
    return this.get(this.questionCache, questionId);
  }

  public setQuestion(questionId: string, data: QuestionResponseDto): void {
    this.set(this.questionCache, questionId, { ...data });
  }

  public invalidateQuestion(questionId: string): void {
    this.questionCache.delete(questionId);
  }

  // ── Banks ────────────────────────────────────────────────────────────────────

  public getBank(bankId: string): QuestionBankEntity | null {
    return this.get(this.bankCache, bankId);
  }

  public setBank(bankId: string, bank: QuestionBankEntity): void {
    this.set(this.bankCache, bankId, { ...bank });
  }

  public invalidateBank(bankId: string, institutionId?: string): void {
    this.bankCache.delete(bankId);
    if (institutionId) this.invalidateBankList(institutionId);
  }

  public getBankList(institutionId: string): QuestionBankEntity[] | null {
    return this.get(this.bankListCache, institutionId);
  }

  public setBankList(institutionId: string, banks: QuestionBankEntity[]): void {
    this.set(this.bankListCache, institutionId, banks.map(b => ({ ...b })));
  }

  public invalidateBankList(institutionId: string): void {
    this.bankListCache.delete(institutionId);
  }

  // ── Pools ────────────────────────────────────────────────────────────────────

  public getPool(poolId: string): QuestionPoolEntity | null {
    return this.get(this.poolCache, poolId);
  }

  public setPool(poolId: string, pool: QuestionPoolEntity): void {
    this.set(this.poolCache, poolId, { ...pool });
  }

  public invalidatePool(poolId: string, bankId?: string): void {
    this.poolCache.delete(poolId);
    if (bankId) this.invalidatePoolList(bankId);
  }

  public getPoolList(bankId: string): QuestionPoolEntity[] | null {
    return this.get(this.poolListCache, bankId);
  }

  public setPoolList(bankId: string, pools: QuestionPoolEntity[]): void {
    this.set(this.poolListCache, bankId, pools.map(p => ({ ...p })));
  }

  public invalidatePoolList(bankId: string): void {
    this.poolListCache.delete(bankId);
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  public getCategories(institutionId: string): QuestionCategoryEntity[] | null {
    return this.get(this.categoryCache, institutionId);
  }

  public setCategories(institutionId: string, categories: QuestionCategoryEntity[]): void {
    this.set(this.categoryCache, institutionId, categories.map(c => ({ ...c })));
  }

  public invalidateCategories(institutionId: string): void {
    this.categoryCache.delete(institutionId);
  }

  // ── Tags ─────────────────────────────────────────────────────────────────────

  public getTags(institutionId: string): QuestionTagEntity[] | null {
    return this.get(this.tagCache, institutionId);
  }

  public setTags(institutionId: string, tags: QuestionTagEntity[]): void {
    this.set(this.tagCache, institutionId, tags.map(t => ({ ...t })));
  }

  public invalidateTags(institutionId: string): void {
    this.tagCache.delete(institutionId);
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  public getAnalytics(questionId: string): QuestionAnalyticsEntity | null {
    return this.get(this.analyticsCache, questionId);
  }

  public setAnalytics(questionId: string, analytics: QuestionAnalyticsEntity): void {
    this.set(this.analyticsCache, questionId, { ...analytics });
  }

  public invalidateAnalytics(questionId: string): void {
    this.analyticsCache.delete(questionId);
  }

  // ── Random Selection ─────────────────────────────────────────────────────────

  public getRandomSelection(cacheKey: string): QuestionResponseDto[] | null {
    return this.get(this.randomCache, cacheKey);
  }

  public setRandomSelection(cacheKey: string, selection: QuestionResponseDto[]): void {
    // Random selections cached for shorter duration: 60 seconds
    this.set(this.randomCache, cacheKey, [...selection], 60_000);
  }

  // ── Full flush ───────────────────────────────────────────────────────────────

  public clear(): void {
    this.questionCache.clear();
    this.bankCache.clear();
    this.bankListCache.clear();
    this.poolCache.clear();
    this.poolListCache.clear();
    this.categoryCache.clear();
    this.tagCache.clear();
    this.analyticsCache.clear();
    this.randomCache.clear();
  }
}
