import { modelManager } from '../models/model-manager';
import { healthManager } from '../health/health-manager';
import { metricsRegistry } from '../metrics/metrics-registry';
import { visionConfigManager, visionConfig } from '../config/vision.config';
import { FramePayload, VisionConfigDTO, VisionEventPayload } from '../types/vision.types';
import { FrameProcessor } from '../pipeline/frame-processor';
import { RuleEngine } from '../rules/rule-engine';
import { ConfidenceFilter } from '../filters/confidence-filter';
import { EventDeduplicator } from '../filters/event-deduplicator';
import { VisionEventPublisher } from '../events/vision-event-publisher';
import { generateShortId } from '@sentinel-ai/utils';

export class VisionGuardService {
  private static instance: VisionGuardService;
  private isInitialized = false;
  private activeStreamsMap = new Map<string, boolean>();

  private frameProcessor = new FrameProcessor();
  private ruleEngine = new RuleEngine();
  private confidenceFilter = new ConfidenceFilter();
  private eventDeduplicator = new EventDeduplicator();
  private eventPublisher = VisionEventPublisher.getInstance();

  public static getInstance(): VisionGuardService {
    if (!VisionGuardService.instance) {
      VisionGuardService.instance = new VisionGuardService();
    }
    return VisionGuardService.instance;
  }

  async start(): Promise<void> {
    if (this.isInitialized) return;
    await modelManager.initializeModel();
    this.isInitialized = true;
  }

  async stop(): Promise<void> {
    if (!this.isInitialized) return;
    await modelManager.unloadModel();
    this.isInitialized = false;
  }

  startStream(sessionId: string): { streamId: string; status: string } {
    this.activeStreamsMap.set(sessionId, true);
    metricsRegistry.setActiveStreams(this.activeStreamsMap.size);
    return { streamId: `str_${sessionId}`, status: 'ACTIVE' };
  }

  stopStream(sessionId: string): { streamId: string; status: string } {
    this.activeStreamsMap.delete(sessionId);
    metricsRegistry.setActiveStreams(this.activeStreamsMap.size);
    return { streamId: `str_${sessionId}`, status: 'STOPPED' };
  }

  getActiveStreamCount(): number {
    return this.activeStreamsMap.size;
  }

  updateConfig(partial: Partial<VisionConfigDTO>): VisionConfigDTO {
    return visionConfigManager.updateConfig(partial);
  }

  async processFrame(payload: FramePayload): Promise<{ processed: boolean; latencyMs: number; eventsTriggered: string[] }> {
    const startTime = Date.now();
    metricsRegistry.incrementFramesProcessed(1);

    // 1. Enqueue the frame for rate limiting & depth checking
    const enqueued = this.frameProcessor.enqueueFrame(payload);
    if (!enqueued) {
      const latency = Date.now() - startTime;
      metricsRegistry.incrementDroppedFrames(1);
      return {
        processed: false,
        latencyMs: latency,
        eventsTriggered: []
      };
    }

    // 2. Dequeue and run YOLO + Face Analyzer
    const result = await this.frameProcessor.processNextFrame();
    if (!result) {
      const latency = Date.now() - startTime;
      return {
        processed: false,
        latencyMs: latency,
        eventsTriggered: []
      };
    }

    // 3. Apply confidence sliding window filter
    const config = visionConfigManager.getConfig();
    const confirmedDetections = this.confidenceFilter.filter(
      payload.candidateSessionId,
      result.detections,
      config.confidenceThreshold
    );

    // 4. Run rule engine
    const rawEvents = this.ruleEngine.evaluate(payload, confirmedDetections, result.faceAnalysis);

    // 5. Deduplicate and publish events
    const eventsTriggered: string[] = [];
    for (const eventType of rawEvents) {
      if (this.eventDeduplicator.shouldEmit(payload.candidateSessionId, eventType)) {
        eventsTriggered.push(eventType);

        const eventId = `ev_vg_${generateShortId(8)}`;
        const eventPayload: VisionEventPayload = {
          eventId,
          eventType,
          candidateId: payload.candidateId,
          candidateSessionId: payload.candidateSessionId,
          institutionId: payload.institutionId,
          examId: payload.examId,
          timestamp: new Date().toISOString(),
          confidence: 0.95,
          metadata: {
            boundingBoxes: confirmedDetections.map((d) => d.bbox).filter(Boolean),
            frameReference: payload.frameIndex ?? 0
          }
        };

        await this.eventPublisher.publishVisionEvent(eventPayload);
        this.frameProcessor.incrementEventsEmitted();
      }
    }

    const latencyMs = Date.now() - startTime;
    metricsRegistry.recordInference(latencyMs);

    if (eventsTriggered.length > 0) {
      metricsRegistry.incrementDetectionEvents(eventsTriggered.length);
    }

    return {
      processed: true,
      latencyMs,
      eventsTriggered
    };
  }

  getObservabilityMetrics() {
    const m = metricsRegistry.getMetrics();
    const fpMetrics = this.frameProcessor.getMetrics();
    return {
      currentFps: fpMetrics.currentFps,
      averageInferenceLatencyMs: m.averageLatencyMs,
      totalFramesProcessed: m.framesProcessed,
      totalDroppedFrames: m.droppedFrames,
      totalEventsEmitted: m.totalDetectionEvents,
      gpuUtilizationPercentage: fpMetrics.gpuUtilizationPercentage,
      cpuUtilizationPercentage: m.cpuUsagePercentage,
      memoryUsageMb: m.memoryUsageMb,
      queueSize: fpMetrics.queueSize
    };
  }

  getHealthSummary() {
    return healthManager.getHealthSummary();
  }

  getStatus() {
    return healthManager.getStatus();
  }

  getMetrics() {
    return metricsRegistry.getMetrics();
  }

  getConfig() {
    return visionConfigManager.getConfig();
  }
}

export const visionGuardService = VisionGuardService.getInstance();
