import { FeatureFlags, NodeEnv } from './types';

export class FeatureFlagsManager {
  private flags: FeatureFlags;

  constructor(env: NodeEnv, initialOverrides?: Partial<FeatureFlags>) {
    const isDev = env === 'development';

    this.flags = {
      enableVisionGuard: true,
      enableBehavioralAnalyst: true,
      enableCollusionDetection: true,
      enableRiskPrediction: true,
      enableAuditHashChain: true,
      enableCheatingSimulator: isDev,
      ...initialOverrides
    };
  }

  public isEnabled(flagName: keyof FeatureFlags): boolean {
    return this.flags[flagName] ?? false;
  }

  public getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  public setFlag(flagName: keyof FeatureFlags, enabled: boolean): void {
    this.flags[flagName] = enabled;
  }
}
