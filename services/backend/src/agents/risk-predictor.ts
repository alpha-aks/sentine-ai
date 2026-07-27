import { DynamicRiskState } from '@sentinel-ai/types';
import { HALF_LIFE_DECAY_SECONDS } from '@sentinel-ai/constants';

interface EventSample {
  timestampMs: number;
  weightedScore: number; // Product of agent signal confidence & severity
  driver: string;
}

export class RiskPredictorAgent {
  private history: EventSample[] = [];
  private lastScore: number = 0;
  private lastTimestampMs: number = Date.now();
  private lambda: number;

  constructor(halfLifeSeconds: number = HALF_LIFE_DECAY_SECONDS) {
    // Decay constant lambda = ln(2) / T_half
    this.lambda = Math.LN2 / halfLifeSeconds;
  }

  public recordEvent(weightedScore: number, driver: string, timestampIso?: string): void {
    const timestampMs = timestampIso ? new Date(timestampIso).getTime() : Date.now();
    this.history.push({
      timestampMs,
      weightedScore,
      driver
    });

    // Prune history older than 30 minutes to keep window focused
    const cutoff = timestampMs - 30 * 60 * 1000;
    this.history = this.history.filter(e => e.timestampMs >= cutoff);
  }

  public computeRiskState(nowIso?: string): DynamicRiskState {
    const nowMs = nowIso ? new Date(nowIso).getTime() : Date.now();
    
    if (this.history.length === 0) {
      return {
        currentRiskScore: 0.0,
        riskVelocity: 0.0,
        primaryRiskDriver: 'Nominal Baseline'
      };
    }

    let accumulatedRisk = 0.0;
    const driverContributions: Record<string, number> = {};

    for (const event of this.history) {
      const deltaSeconds = Math.max(0, (nowMs - event.timestampMs) / 1000);
      const decayedImpact = event.weightedScore * Math.exp(-this.lambda * deltaSeconds);
      accumulatedRisk += decayedImpact;

      driverContributions[event.driver] = (driverContributions[event.driver] || 0) + decayedImpact;
    }

    // Clamp score to [0.00, 1.00]
    const currentRiskScore = Math.min(1.0, Math.max(0.0, Math.round(accumulatedRisk * 100) / 100));

    // Calculate risk velocity (change per minute)
    const timeDeltaMinutes = Math.max(0.01, (nowMs - this.lastTimestampMs) / (1000 * 60));
    const rawVelocity = (currentRiskScore - this.lastScore) / timeDeltaMinutes;
    const riskVelocity = Math.round(rawVelocity * 100) / 100;

    // Find primary driver
    let primaryDriver = 'Nominal Baseline';
    let maxContribution = 0;
    for (const [driver, score] of Object.entries(driverContributions)) {
      if (score > maxContribution) {
        maxContribution = score;
        primaryDriver = driver;
      }
    }

    this.lastScore = currentRiskScore;
    this.lastTimestampMs = nowMs;

    return {
      currentRiskScore,
      riskVelocity,
      primaryRiskDriver: primaryDriver
    };
  }
}
