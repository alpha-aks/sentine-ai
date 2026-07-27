import { HealthStatus, VisionServiceStatusDTO } from '../types/vision.types';
import { visionConfig } from '../config/vision.config';
import { modelManager } from '../models/model-manager';

class HealthManager {
  private readonly startupTime: Date;

  constructor() {
    this.startupTime = new Date();
  }

  public getStatus(): VisionServiceStatusDTO {
    const uptimeSeconds = Math.floor((Date.now() - this.startupTime.getTime()) / 1000);
    const modelHealth = modelManager.healthCheck();

    let overallStatus: HealthStatus = 'HEALTHY';
    if (modelHealth !== 'HEALTHY') {
      overallStatus = 'DEGRADED';
    }

    return {
      serviceName: visionConfig.serviceName,
      version: '1.0.0',
      environment: visionConfig.environment,
      status: overallStatus,
      startupTimestamp: this.startupTime.toISOString(),
      uptimeSeconds,
      activeStreams: 0,
      inferenceMode: visionConfig.inferenceMode,
      gpuEnabled: visionConfig.gpuEnabled
    };
  }

  public getHealthSummary() {
    const status = this.getStatus();
    return {
      status: status.status,
      service: status.serviceName,
      timestamp: new Date().toISOString(),
      uptimeSeconds: status.uptimeSeconds,
      dependencies: {
        modelManager: modelManager.healthCheck(),
        eventBus: 'HEALTHY'
      }
    };
  }
}

export const healthManager = new HealthManager();
