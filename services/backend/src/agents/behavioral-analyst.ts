import { BehaviorSignal, TelemetryVector } from '@sentinel-ai/types';

export class BehavioralAnalystAgent {
  public processInteraction(telemetry: TelemetryVector): BehaviorSignal {
    const dwell = telemetry.keystrokeDwellMs ?? 110;
    const flight = telemetry.keystrokeFlightMs ?? 150;
    const linearity = telemetry.mouseLinearityR2 ?? 0.45;
    const pastedLength = telemetry.pastedLength ?? 0;
    const windowBlur = telemetry.windowBlur ?? false;

    // Keystroke anomaly scoring: extremely fast typing or zero-variance timing indicates macro/proxy
    let keystrokeAnomalyScore = 0.05;
    if (dwell < 15 || flight === 0) keystrokeAnomalyScore = 0.92; // Automated macro
    else if (dwell > 350 || flight > 800) keystrokeAnomalyScore = 0.65; // Proxy hesitation

    // Mouse robotic score: linearity R^2 > 0.95 indicates straight-line automated cursor
    const mouseRoboticScore = linearity > 0.95 ? 0.94 : 0.08;

    const largePasteFlag = pastedLength > 40;
    const windowBlurFlag = windowBlur;

    let confidence = 0.92;
    if (largePasteFlag) confidence = 1.0;
    else if (keystrokeAnomalyScore > 0.8) confidence = 0.95;

    return {
      agentId: 'BEHAVIORAL_ANALYST',
      timestamp: telemetry.timestamp,
      confidence,
      keystrokeAnomalyScore,
      mouseRoboticScore,
      largePasteFlag,
      windowBlurFlag
    };
  }
}
