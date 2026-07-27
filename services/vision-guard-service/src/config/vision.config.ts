import { VisionConfigDTO, InferenceMode, GpuMode } from '../types/vision.types';

export class VisionConfigManager {
  private static instance: VisionConfigManager;
  private config: VisionConfigDTO;

  constructor() {
    const serviceName = process.env.SERVICE_NAME || 'vision-guard-service';
    const environment = process.env.NODE_ENV || 'development';
    const port = parseInt(process.env.PORT || '4009', 10);
    const logLevel = process.env.LOG_LEVEL || 'info';

    const inferenceMode: InferenceMode = (process.env.INFERENCE_MODE as InferenceMode) || 'CPU';
    const gpuEnabled = process.env.GPU_ENABLED === 'true';
    const gpuMode: GpuMode = (process.env.GPU_MODE as GpuMode) || (gpuEnabled ? 'CUDA' : 'DISABLED');
    const modelPath = process.env.MODEL_PATH || './models/yolov8n.onnx';

    const frameQueueSize = parseInt(process.env.FRAME_QUEUE_SIZE || '100', 10);
    const defaultFps = parseInt(process.env.DEFAULT_FPS || '15', 10);
    const defaultResolutionWidth = parseInt(process.env.DEFAULT_RESOLUTION_WIDTH || '1280', 10);
    const defaultResolutionHeight = parseInt(process.env.DEFAULT_RESOLUTION_HEIGHT || '720', 10);

    const healthIntervalMs = parseInt(process.env.HEALTH_INTERVAL_MS || '10000', 10);
    const metricsIntervalMs = parseInt(process.env.METRICS_INTERVAL_MS || '5000', 10);

    this.config = {
      serviceName,
      environment,
      port,
      logLevel,
      inferenceMode,
      gpuEnabled,
      gpuMode,
      modelPath,
      frameQueueSize,
      defaultFps,
      defaultResolutionWidth,
      defaultResolutionHeight,
      healthIntervalMs,
      metricsIntervalMs,
      confidenceThreshold: 0.5,
      fps: defaultFps,
      resolutionWidth: defaultResolutionWidth,
      resolutionHeight: defaultResolutionHeight,
      skipFrames: 0
    };

    this.validateConfig();
  }

  public static getInstance(): VisionConfigManager {
    if (!VisionConfigManager.instance) {
      VisionConfigManager.instance = new VisionConfigManager();
    }
    return VisionConfigManager.instance;
  }

  public updateConfig(partial: Partial<VisionConfigDTO>): VisionConfigDTO {
    this.config = { ...this.config, ...partial };
    return this.getConfig();
  }

  private validateConfig(): void {
    if (isNaN(this.config.port) || this.config.port <= 0 || this.config.port > 65535) {
      throw new Error(`Invalid PORT configuration: ${this.config.port}`);
    }
    if (isNaN(this.config.frameQueueSize) || this.config.frameQueueSize <= 0) {
      throw new Error(`Invalid FRAME_QUEUE_SIZE configuration: ${this.config.frameQueueSize}`);
    }
  }

  public getConfig(): VisionConfigDTO {
    return { ...this.config };
  }
}

export const visionConfigManager = VisionConfigManager.getInstance();
export const visionConfig = visionConfigManager.getConfig();
