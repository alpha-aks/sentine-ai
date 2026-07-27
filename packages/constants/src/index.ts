import { AgentWeights, RiskThresholds, SensitivityProfile } from '@sentinel-ai/types';

export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = {
  low: 0.4,
  medium: 0.55,
  high: 0.7,
  critical: 0.85
};

export const DEFAULT_AGENT_WEIGHTS: AgentWeights = {
  vision: 0.35,
  behavior: 0.25,
  collusion: 0.25,
  risk: 0.15
};

export const SENSITIVITY_PRESETS: Record<
  SensitivityProfile,
  { weights: AgentWeights; thresholds: RiskThresholds }
> = {
  STRICT: {
    weights: { vision: 0.4, behavior: 0.25, collusion: 0.25, risk: 0.1 },
    thresholds: { low: 0.3, medium: 0.45, high: 0.6, critical: 0.75 }
  },
  STANDARD: {
    weights: { vision: 0.35, behavior: 0.25, collusion: 0.25, risk: 0.15 },
    thresholds: { low: 0.4, medium: 0.55, high: 0.7, critical: 0.85 }
  },
  LOW: {
    weights: { vision: 0.3, behavior: 0.2, collusion: 0.2, risk: 0.3 },
    thresholds: { low: 0.5, medium: 0.65, high: 0.8, critical: 0.9 }
  },
  CUSTOM: {
    weights: DEFAULT_AGENT_WEIGHTS,
    thresholds: DEFAULT_RISK_THRESHOLDS
  }
};

export const HALF_LIFE_DECAY_SECONDS = 180; // 3-minute risk half-life

export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  EXAM_NOT_FOUND: 'EXAM_NOT_FOUND',
  SESSION_LOCKED: 'SESSION_LOCKED',
  AI_AGENT_TIMEOUT: 'AI_AGENT_TIMEOUT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;
