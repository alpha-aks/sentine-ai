import {
  TelemetryVector,
  VisionSignal,
  BehaviorSignal,
  CollusionSignal,
  OrchestratedDecision,
  AlertLevel,
  AgentWeights,
  RiskThresholds
} from '@sentinel-ai/types';
import { DEFAULT_AGENT_WEIGHTS, DEFAULT_RISK_THRESHOLDS } from '@sentinel-ai/constants';
import { VisionGuardAgent } from './vision-guard';
import { BehavioralAnalystAgent } from './behavioral-analyst';
import { CollusionDetectionAgent } from './collusion-detector';
import { RiskPredictorAgent } from './risk-predictor';

export class DecisionOrchestratorAgent {
  private visionGuard: VisionGuardAgent;
  private behavioralAnalyst: BehavioralAnalystAgent;
  private collusionDetection: CollusionDetectionAgent;
  private riskPredictor: RiskPredictorAgent;
  
  private weights: AgentWeights;
  private thresholds: RiskThresholds;

  constructor(
    weights: AgentWeights = DEFAULT_AGENT_WEIGHTS,
    thresholds: RiskThresholds = DEFAULT_RISK_THRESHOLDS
  ) {
    this.visionGuard = new VisionGuardAgent();
    this.behavioralAnalyst = new BehavioralAnalystAgent();
    this.collusionDetection = new CollusionDetectionAgent();
    this.riskPredictor = new RiskPredictorAgent();

    this.weights = weights;
    this.thresholds = thresholds;
  }

  public setPolicy(weights: AgentWeights, thresholds: RiskThresholds): void {
    this.weights = weights;
    this.thresholds = thresholds;
  }

  public evaluateTelemetry(telemetry: TelemetryVector): OrchestratedDecision {
    const visionSignal = this.visionGuard.processFrame(telemetry);
    const behaviorSignal = this.behavioralAnalyst.processInteraction(telemetry);
    const collusionSignal = this.collusionDetection.processAudioAndText(telemetry);

    // Compute raw severity for each agent (0.0 to 1.0)
    let visionSeverity = 0;
    if (visionSignal.cameraTamperFlag) visionSeverity = 1.0;
    else if (visionSignal.detectedDevices.length > 0) visionSeverity = 0.90;
    else if (visionSignal.personCount > 1) visionSeverity = 0.85;
    else if (visionSignal.headPoseAnomaly) visionSeverity = 0.65;
    else if (visionSignal.offscreenGazeFlag) visionSeverity = 0.50;

    let behaviorSeverity = 0;
    if (behaviorSignal.windowBlurFlag) behaviorSeverity = 0.70;
    else if (behaviorSignal.largePasteFlag) behaviorSeverity = 0.85;
    else if (behaviorSignal.keystrokeAnomalyScore > 0.7) behaviorSeverity = 0.60;
    else if (behaviorSignal.mouseRoboticScore > 0.7) behaviorSeverity = 0.55;

    let collusionSeverity = 0;
    if (collusionSignal.wifiCollusionFlag) collusionSeverity = 0.85;
    else if (collusionSignal.whisperDetected) collusionSeverity = 0.80;
    else if (collusionSignal.speechDetected) collusionSeverity = 0.65;
    else if (collusionSignal.essaySimilarityScore > 0.8) collusionSeverity = 0.90;

    // Cross-modal correlation & False Positive Suppression:
    // If only a single low/mid severity trigger occurs without secondary validation, apply a dampening factor (0.65x).
    const activeTriggers = [visionSeverity > 0.4, behaviorSeverity > 0.4, collusionSeverity > 0.4].filter(Boolean).length;
    let correlationMultiplier = 1.0;
    if (activeTriggers === 1) {
      correlationMultiplier = 0.65; // Single-detector suppression logic
    } else if (activeTriggers >= 2) {
      correlationMultiplier = 1.25; // Multi-modal escalation boost
    }

    const currentWeightedImpact = (
      (visionSeverity * visionSignal.confidence * this.weights.vision) +
      (behaviorSeverity * behaviorSignal.confidence * this.weights.behavior) +
      (collusionSeverity * collusionSignal.confidence * this.weights.collusion)
    ) * correlationMultiplier;

    // Determine driver string for temporal accumulation
    let currentDriver = 'Nominal';
    if (visionSeverity >= Math.max(behaviorSeverity, collusionSeverity) && visionSeverity > 0) {
      currentDriver = visionSignal.cameraTamperFlag ? 'Camera Tampering' :
                      visionSignal.detectedDevices.length > 0 ? `Unauthorized Object (${visionSignal.detectedDevices.join(', ')})` :
                      visionSignal.personCount > 1 ? `Multiple Persons (${visionSignal.personCount})` : 'Persistent Offscreen Gaze';
    } else if (behaviorSeverity >= Math.max(visionSeverity, collusionSeverity) && behaviorSeverity > 0) {
      currentDriver = behaviorSignal.largePasteFlag ? 'Clipboard Paste Anomaly' :
                      behaviorSignal.windowBlurFlag ? 'Focus Lost / Tab Switch' : 'Keystroke/Mouse Anomaly';
    } else if (collusionSeverity > 0) {
      currentDriver = collusionSignal.wifiCollusionFlag ? `Local Subnet Collusion (${collusionSignal.wifiCollusionDetail || 'Search Activity'})` :
                      collusionSignal.whisperDetected ? 'Acoustic Whisper Detected' :
                      collusionSignal.speechDetected ? 'Secondary Voice Activity' : 'Semantic Similarity Correlation';
    }

    if (currentWeightedImpact > 0.1) {
      this.riskPredictor.recordEvent(currentWeightedImpact, currentDriver, telemetry.timestamp);
    }

    const dynamicState = this.riskPredictor.computeRiskState(telemetry.timestamp);
    const isWifiCritical = collusionSignal.wifiCollusionFlag ?? false;
    const finalRiskScore = isWifiCritical ? 1.00 : dynamicState.currentRiskScore;

    // Determine Alert Level based on policy thresholds
    let alertLevel: AlertLevel = 'NONE';
    if (isWifiCritical || finalRiskScore >= this.thresholds.critical) alertLevel = 'CRITICAL';
    else if (finalRiskScore >= this.thresholds.high) alertLevel = 'HIGH';
    else if (finalRiskScore >= this.thresholds.medium) alertLevel = 'MEDIUM';
    else if (finalRiskScore >= this.thresholds.low) alertLevel = 'LOW';

    // Generate Natural Language XAI Trace
    const evidenceList: string[] = [];
    if (visionSignal.offscreenGazeFlag) evidenceList.push('Off-screen gaze trajectory detected');
    if (visionSignal.headPoseAnomaly) evidenceList.push('Unusual head pose orientation (>40 deg)');
    if (visionSignal.personCount > 1) evidenceList.push(`${visionSignal.personCount} faces detected in frame`);
    if (visionSignal.detectedDevices.length > 0) evidenceList.push(`Secondary device(s) visible: ${visionSignal.detectedDevices.join(', ')}`);
    if (behaviorSignal.largePasteFlag) evidenceList.push('Unusually large text insertion from external clipboard');
    if (behaviorSignal.windowBlurFlag) evidenceList.push('Browser window focus lost');
    if (collusionSignal.wifiCollusionFlag) evidenceList.push(`WiFi Subnet Collusion Intercepted: ${collusionSignal.wifiCollusionDetail || 'ChatGPT query detected'}`);
    if (collusionSignal.whisperDetected) evidenceList.push('Low-frequency acoustic whisper pattern isolated');
    if (collusionSignal.speechDetected) evidenceList.push('Human speech detected in audio stream');

    const naturalLanguageExplanation = evidenceList.length > 0
      ? `Flagged due to: ${evidenceList.join('; ')}. Primary risk driver: ${isWifiCritical ? 'Prohibited Wi-Fi Subnet Query (Instant Termination)' : dynamicState.primaryRiskDriver}.`
      : 'Session operating within expected nominal integrity parameters.';

    let recommendedAction = 'Continue passive monitoring';
    if (isWifiCritical) recommendedAction = 'IMMEDIATE TERMINATION: Auto-lock exam session and flag for administrative review';
    else if (alertLevel === 'CRITICAL') recommendedAction = 'IMMEDIATE INTERVENTION RECOMMENDED: Pause session or issue strict warning toast';
    else if (alertLevel === 'HIGH') recommendedAction = 'Review multi-modal evidence clip and issue candidate warning';
    else if (alertLevel === 'MEDIUM') recommendedAction = 'Monitor active stream for secondary risk triggers';

    return {
      decisionId: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId: telemetry.sessionId,
      timestamp: telemetry.timestamp,
      finalRiskScore,
      alertLevel,
      correlatedEvidence: evidenceList,
      naturalLanguageExplanation,
      recommendedAction,
      visionSignal,
      behaviorSignal,
      collusionSignal
    };
  }
}
