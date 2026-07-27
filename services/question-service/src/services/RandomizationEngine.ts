import { fastHash } from '@sentinel-ai/utils';
import { DifficultyLevel, QuestionResponseDto } from '../types/question';

// ── PRNG ─────────────────────────────────────────────────────────────────────

function createMulberry32(seedInput: string | number): () => number {
  let seed = typeof seedInput === 'number' ? seedInput : fastHash(String(seedInput));
  return (): number => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── RandomizationEngine ───────────────────────────────────────────────────────

export class RandomizationEngine {
  /**
   * Seeded Fisher-Yates shuffle.  Returns a *new* array.
   */
  public shuffle<T>(array: T[], seed?: string | number): T[] {
    const list = [...array];
    if (list.length <= 1) return list;

    const prng = seed !== undefined ? createMulberry32(seed) : Math.random;
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  /**
   * Selects questions maintaining an exact difficulty distribution.
   * Falls back to random fill-in when any bucket is under-supplied.
   */
  public balanceDifficulty<T extends { difficulty: DifficultyLevel }>(
    questions: T[],
    targetCount: number,
    distribution: Record<DifficultyLevel, number>,
    seed?: string | number
  ): T[] {
    const easy   = this.shuffle(questions.filter(q => q.difficulty === 'EASY'),   seed);
    const medium = this.shuffle(questions.filter(q => q.difficulty === 'MEDIUM'), seed !== undefined ? `${seed}_med`  : undefined);
    const hard   = this.shuffle(questions.filter(q => q.difficulty === 'HARD'),   seed !== undefined ? `${seed}_hard` : undefined);

    const selected: T[] = [
      ...easy.slice(0, distribution.EASY),
      ...medium.slice(0, distribution.MEDIUM),
      ...hard.slice(0, distribution.HARD)
    ];

    if (selected.length < targetCount) {
      const selectedSet = new Set(selected);
      const remaining = this.shuffle(
        questions.filter(q => !selectedSet.has(q)),
        seed
      );
      selected.push(...remaining.slice(0, targetCount - selected.length));
    }

    return this.shuffle(selected, seed !== undefined ? `${seed}_final` : undefined).slice(0, targetCount);
  }

  /**
   * Selects questions maintaining a topic/tag distribution.
   * Each key in `distribution` represents a tag; value is the quota.
   * Remaining slots are filled randomly.
   */
  public balanceTopic<T extends { tags: string[] }>(
    questions: T[],
    targetCount: number,
    topicDistribution: Record<string, number>,
    seed?: string | number
  ): T[] {
    const selected: T[] = [];
    const used = new Set<T>();

    const topics = Object.entries(topicDistribution);
    for (const [topic, quota] of topics) {
      const candidates = this.shuffle(
        questions.filter(q => q.tags.includes(topic) && !used.has(q)),
        seed !== undefined ? `${seed}_topic_${topic}` : undefined
      );
      const picked = candidates.slice(0, quota);
      picked.forEach(q => { selected.push(q); used.add(q); });
    }

    if (selected.length < targetCount) {
      const remaining = this.shuffle(
        questions.filter(q => !used.has(q)),
        seed
      );
      selected.push(...remaining.slice(0, targetCount - selected.length));
    }

    return this.shuffle(selected, seed !== undefined ? `${seed}_tFinal` : undefined).slice(0, targetCount);
  }

  /**
   * Full pipeline: apply exclusions → difficulty balance → topic balance → shuffle.
   */
  public selectFromPool(
    allQuestions: QuestionResponseDto[],
    opts: {
      targetCount: number;
      excludedIds?: string[];
      difficultyDistribution?: Record<DifficultyLevel, number>;
      topicDistribution?: Record<string, number>;
      seed?: string | number;
      randomizeOptions?: boolean;
    }
  ): QuestionResponseDto[] {
    let candidates = allQuestions.filter(
      q => !(opts.excludedIds || []).includes(q.question.questionId)
    );

    // Difficulty balance
    if (opts.difficultyDistribution) {
      const mapped = candidates.map(c => ({ difficulty: c.question.difficulty, ...c }));
      const balanced = this.balanceDifficulty(mapped, opts.targetCount, opts.difficultyDistribution, opts.seed);
      candidates = balanced;
    }

    // Topic balance
    if (opts.topicDistribution && Object.keys(opts.topicDistribution).length > 0) {
      const mapped = candidates.map(c => ({ tags: c.question.tags, ...c }));
      const balanced = this.balanceTopic(mapped, opts.targetCount, opts.topicDistribution, opts.seed);
      candidates = balanced;
    }

    let selected = this.shuffle(candidates, opts.seed).slice(0, opts.targetCount);

    // Option order randomization
    if (opts.randomizeOptions) {
      selected = selected.map(q => {
        if (q.options && q.options.length > 0) {
          return {
            ...q,
            options: this.shuffle(
              q.options,
              opts.seed !== undefined ? `${opts.seed}_opt_${q.question.questionId}` : undefined
            )
          };
        }
        return q;
      });
    }

    return selected;
  }

  /**
   * Returns a deterministic seed integer from any seed input.
   */
  public deriveSeedInt(seed: string | number): number {
    return typeof seed === 'number' ? seed : fastHash(String(seed));
  }
}
