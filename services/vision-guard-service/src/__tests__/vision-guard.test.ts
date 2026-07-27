import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { VisionGuardService } from '../services/vision-guard.service';
import { YoloDetector } from '../engine/yolo-detector';
import { HeadPoseEstimator } from '../engine/head-pose-estimator';
import { VisionConfigManager } from '../config/vision.config';
import { FrameProcessor } from '../pipeline/frame-processor';

describe('Vision Guard AI Microservice Test Suite', () => {
  let service: VisionGuardService;
  let configManager: VisionConfigManager;

  beforeEach(() => {
    service = VisionGuardService.getInstance();
    configManager = VisionConfigManager.getInstance();
    configManager.updateConfig({
      confidenceThreshold: 0.65,
      fps: 15,
      executionMode: 'GPU',
      maxLatencyMs: 100
    });
  });

  describe('1. YOLO Object Detection Engine & Supported Classes', () => {
    it('1.1 Detects cell phone object and filters by confidence threshold', async () => {
      const detector = new YoloDetector();
      const results = await detector.detect({
        candidateId: 'cand_test_01',
        candidateSessionId: 'sess_test_01',
        institutionId: 'inst_mit_01',
        timestamp: new Date().toISOString(),
        frameIndex: 1,
        width: 1280,
        height: 720,
        simulatedObjects: ['cell phone', 'laptop']
      });

      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0]?.label, 'cell phone');
      assert.ok(results[0]?.confidence !== undefined && results[0].confidence >= 0.65);
    });

    it('1.2 Ignores unsupported object classes', async () => {
      const detector = new YoloDetector();
      const results = await detector.detect({
        candidateId: 'cand_test_01',
        candidateSessionId: 'sess_test_01',
        institutionId: 'inst_mit_01',
        timestamp: new Date().toISOString(),
        frameIndex: 1,
        width: 1280,
        height: 720,
        simulatedObjects: ['cell phone', 'unsupported_alien_item' as any]
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.label, 'cell phone');
    });
  });

  describe('2. Head Pose Vector Estimation', () => {
    it('2.1 Correctly classifies LOOKING_LEFT and LOOKING_RIGHT head angles', () => {
      const estimator = new HeadPoseEstimator();
      const leftPose = estimator.estimatePose({ yaw: -30, pitch: 0, roll: 0 });
      assert.strictEqual(leftPose.orientation, 'LOOKING_LEFT');

      const rightPose = estimator.estimatePose({ yaw: 30, pitch: 0, roll: 0 });
      assert.strictEqual(rightPose.orientation, 'LOOKING_RIGHT');
    });

    it('2.2 Classifies LOOKING_AWAY for extreme head angles', () => {
      const estimator = new HeadPoseEstimator();
      const awayPose = estimator.estimatePose({ yaw: 45, pitch: 35, roll: 10 });
      assert.strictEqual(awayPose.orientation, 'LOOKING_AWAY');
    });
  });

  describe('3. Vision Event Processing & Detection Rules', () => {
    it('3.1 Triggers NO_FACE event when 0 faces detected', async () => {
      const res = await service.processFrame({
        candidateId: 'cand_test_01',
        candidateSessionId: 'sess_rules_01',
        institutionId: 'inst_mit_01',
        timestamp: new Date().toISOString(),
        frameIndex: 10,
        width: 1280,
        height: 720,
        simulatedFaceCount: 0
      });

      assert.strictEqual(res.processed, true);
      assert.ok(res.eventsTriggered.includes('NO_FACE'));
    });

    it('3.2 Triggers MULTIPLE_FACES and SECOND_PERSON events', async () => {
      const res = await service.processFrame({
        candidateId: 'cand_test_02',
        candidateSessionId: 'sess_rules_02',
        institutionId: 'inst_mit_01',
        timestamp: new Date().toISOString(),
        frameIndex: 12,
        width: 1280,
        height: 720,
        simulatedFaceCount: 2,
        simulatedObjects: ['person', 'person']
      });

      assert.strictEqual(res.processed, true);
      assert.ok(res.eventsTriggered.includes('MULTIPLE_FACES'));
      assert.ok(res.eventsTriggered.includes('SECOND_PERSON'));
    });

    it('3.3 Triggers PHONE_DETECTED event when cell phone present', async () => {
      const res = await service.processFrame({
        candidateId: 'cand_test_03',
        candidateSessionId: 'sess_rules_03',
        institutionId: 'inst_mit_01',
        timestamp: new Date().toISOString(),
        frameIndex: 15,
        width: 1280,
        height: 720,
        simulatedObjects: ['cell phone']
      });

      assert.strictEqual(res.processed, true);
      assert.ok(res.eventsTriggered.includes('PHONE_DETECTED'));
    });
  });

  describe('4. Performance Benchmark & Latency Target', () => {
    it('4.1 Completes frame processing under 100ms target latency', async () => {
      const start = performance.now();
      const res = await service.processFrame({
        candidateId: 'cand_perf_01',
        candidateSessionId: 'sess_perf_01',
        institutionId: 'inst_mit_01',
        timestamp: new Date().toISOString(),
        frameIndex: 1,
        width: 1280,
        height: 720
      });
      const end = performance.now();

      assert.strictEqual(res.processed, true);
      assert.ok(end - start < 100, `Inference latency (${end - start}ms) must be < 100ms target`);
    });
  });

  describe('5. Observability & Runtime Metrics', () => {
    it('5.1 Accurately tracks frames processed and observability metrics', () => {
      const metrics = service.getObservabilityMetrics();
      assert.ok(metrics.totalFramesProcessed >= 0);
      assert.strictEqual(metrics.currentFps, 15);
      assert.ok(metrics.memoryUsageMb > 0);
    });
  });
});
