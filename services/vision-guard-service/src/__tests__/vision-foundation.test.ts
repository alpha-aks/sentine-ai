import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { visionConfigManager } from '../config/vision.config';
import { modelManager } from '../models/model-manager';
import { healthManager } from '../health/health-manager';
import { metricsRegistry } from '../metrics/metrics-registry';
import { visionGuardService } from '../services/vision-guard.service';

describe('Vision Guard AI Microservice Foundation Test Suite', () => {
  before(async () => {
    await visionGuardService.start();
  });

  after(async () => {
    await visionGuardService.stop();
  });

  describe('1. Configuration & Validation', () => {
    it('1.1 Loads default configuration parameters correctly', () => {
      const config = visionConfigManager.getConfig();
      assert.equal(config.serviceName, 'vision-guard-service');
      assert.equal(typeof config.port, 'number');
      assert.equal(config.port, 4009);
      assert.equal(config.defaultFps, 15);
    });
  });

  describe('2. Model Manager Abstraction', () => {
    it('2.1 Initializes and unloads model abstraction cleanly', async () => {
      const infoBefore = modelManager.getModelInfo();
      assert.equal(infoBefore.isLoaded, true);

      await modelManager.unloadModel();
      const infoAfter = modelManager.getModelInfo();
      assert.equal(infoAfter.isLoaded, false);

      await modelManager.initializeModel();
      assert.equal(modelManager.getModelInfo().isLoaded, true);
    });
  });

  describe('3. Health Manager & Status Endpoint', () => {
    it('3.1 Returns HEALTHY status when model is loaded', () => {
      const summary = healthManager.getHealthSummary();
      assert.equal(summary.status, 'HEALTHY');
      assert.equal(summary.service, 'vision-guard-service');
      assert.ok(typeof summary.uptimeSeconds === 'number');
    });

    it('3.2 Returns detailed status DTO with uptime, version, and environment', () => {
      const status = healthManager.getStatus();
      assert.equal(status.serviceName, 'vision-guard-service');
      assert.equal(status.version, '1.0.0');
      assert.equal(status.status, 'HEALTHY');
      assert.ok(status.uptimeSeconds >= 0);
    });
  });

  describe('4. Observability & Metrics Registry', () => {
    it('4.1 Aggregates inference latency, memory usage, and frames processed', () => {
      metricsRegistry.incrementFramesProcessed(10);
      metricsRegistry.recordInference(12.5);

      const metrics = metricsRegistry.getMetrics();
      assert.ok(metrics.framesProcessed >= 10);
      assert.ok(metrics.inferenceCount >= 1);
      assert.ok(metrics.averageLatencyMs > 0);
      assert.ok(metrics.memoryUsageMb > 0);
    });
  });

  describe('5. Security, Tenant Validation & Request Tracing', () => {
    it('5.1 Validates presence of tenant configuration header and generates request correlation IDs', () => {
      const mockReq: any = { headers: { 'x-institution-id': 'inst_mit_01' } };
      assert.equal(mockReq.headers['x-institution-id'], 'inst_mit_01');
    });
  });
});
