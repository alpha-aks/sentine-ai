import { QuestionAnalyticsEntity, RecordAttemptDto } from '../types/question';
import { generateUuid } from '@sentinel-ai/utils';

// ─────────────────────────────────────────────────────────────────────────────
// AnalyticsEngine
// ─────────────────────────────────────────────────────────────────────────────
// Computes standard psychometric metrics on top of raw attempt data:
//   • Difficulty Index (p-value)      = correct / total
//   • Discrimination Index            = approximated via correlation proxy
// ─────────────────────────────────────────────────────────────────────────────

export class AnalyticsEngine {
  /**
   * Applies a new attempt to an existing analytics entity and returns the
   * updated entity.  If no existing entity is passed, one is created fresh.
   */
  public applyAttempt(
    dto: RecordAttemptDto,
    existing: QuestionAnalyticsEntity | null
  ): QuestionAnalyticsEntity {
    const now = new Date().toISOString();

    const base: QuestionAnalyticsEntity = existing ?? {
      analyticsId: generateUuid(),
      questionId: dto.questionId,
      institutionId: dto.institutionId,
      totalAttempts: 0,
      correctAttempts: 0,
      partialCorrectAttempts: 0,
      incorrectAttempts: 0,
      avgResponseTimeSeconds: 0,
      difficultyIndex: 0,
      discriminationIndex: 0,
      lastAttemptAt: null,
      updatedAt: now
    };

    const total = base.totalAttempts + 1;
    const correct = base.correctAttempts + (dto.isCorrect ? 1 : 0);
    const partial = base.partialCorrectAttempts + (dto.isPartiallyCorrect && !dto.isCorrect ? 1 : 0);
    const incorrect = base.incorrectAttempts + (!dto.isCorrect && !dto.isPartiallyCorrect ? 1 : 0);

    // Running average response time (Welford's online update)
    const prevAvg = base.avgResponseTimeSeconds;
    const newAvg = prevAvg + (dto.responseTimeSeconds - prevAvg) / total;

    // Difficulty index (p-value): proportion of correct responses
    const difficultyIndex = total > 0 ? correct / total : 0;

    // Discrimination index proxy: deviation of correct-answer group response
    // speed vs average.  Simplified formula usable without full item-response data.
    // DI = 2 * (p - 0.5) * sign(speed advantage)
    const speedAdvantage = dto.isCorrect
      ? Math.max(0, newAvg - dto.responseTimeSeconds) / Math.max(1, newAvg)
      : 0;
    const discriminationIndex = Math.min(
      1,
      Math.max(-1, base.discriminationIndex * 0.9 + 2 * (difficultyIndex - 0.5) * speedAdvantage * 0.1)
    );

    return {
      ...base,
      totalAttempts: total,
      correctAttempts: correct,
      partialCorrectAttempts: partial,
      incorrectAttempts: incorrect,
      avgResponseTimeSeconds: parseFloat(newAvg.toFixed(2)),
      difficultyIndex: parseFloat(difficultyIndex.toFixed(4)),
      discriminationIndex: parseFloat(discriminationIndex.toFixed(4)),
      lastAttemptAt: now,
      updatedAt: now
    };
  }

  /**
   * Summarise bank-level analytics – averages across all questions.
   */
  public summariseBankAnalytics(entities: QuestionAnalyticsEntity[]): {
    totalAttempts: number;
    avgDifficultyIndex: number;
    avgDiscriminationIndex: number;
    avgResponseTimeSeconds: number;
    questionCount: number;
  } {
    if (entities.length === 0) {
      return {
        totalAttempts: 0,
        avgDifficultyIndex: 0,
        avgDiscriminationIndex: 0,
        avgResponseTimeSeconds: 0,
        questionCount: 0
      };
    }

    const totalAttempts = entities.reduce((s, e) => s + e.totalAttempts, 0);
    const avgDifficultyIndex = entities.reduce((s, e) => s + e.difficultyIndex, 0) / entities.length;
    const avgDiscriminationIndex = entities.reduce((s, e) => s + e.discriminationIndex, 0) / entities.length;
    const avgResponseTimeSeconds = entities.reduce((s, e) => s + e.avgResponseTimeSeconds, 0) / entities.length;

    return {
      totalAttempts,
      avgDifficultyIndex: parseFloat(avgDifficultyIndex.toFixed(4)),
      avgDiscriminationIndex: parseFloat(avgDiscriminationIndex.toFixed(4)),
      avgResponseTimeSeconds: parseFloat(avgResponseTimeSeconds.toFixed(2)),
      questionCount: entities.length
    };
  }
}
