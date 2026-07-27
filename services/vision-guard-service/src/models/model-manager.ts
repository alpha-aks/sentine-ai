import { InferenceMode, GpuMode, HealthStatus } from '../types/vision.types';
import { visionConfig } from '../config/vision.config';

export interface ModelInfo {
  name: string;
  version: string;
  path: string;
  isLoaded: boolean;
  inferenceMode: InferenceMode;
  gpuMode: GpuMode;
}

export interface IModelManager {
  initializeModel(): Promise<void>;
  unloadModel(): Promise<void>;
  reloadModel(): Promise<void>;
  getModelInfo(): ModelInfo;
  getRuntimeMode(): { inferenceMode: InferenceMode; gpuMode: GpuMode };
  healthCheck(): HealthStatus;
}

export class ModelManager implements IModelManager {
  private isLoaded = false;
  private readonly modelName = 'VisionGuard-YOLOv8';
  private readonly version = '1.0.0-foundation';

  async initializeModel(): Promise<void> {
    // Abstraction foundation: future prompts will load YOLO ONNX / TensorRT runtime weights
    this.isLoaded = true;
  }

  async unloadModel(): Promise<void> {
    this.isLoaded = false;
  }

  async reloadModel(): Promise<void> {
    await this.unloadModel();
    await this.initializeModel();
  }

  getModelInfo(): ModelInfo {
    return {
      name: this.modelName,
      version: this.version,
      path: visionConfig.modelPath,
      isLoaded: this.isLoaded,
      inferenceMode: visionConfig.inferenceMode,
      gpuMode: visionConfig.gpuMode
    };
  }

  getRuntimeMode(): { inferenceMode: InferenceMode; gpuMode: GpuMode } {
    return {
      inferenceMode: visionConfig.inferenceMode,
      gpuMode: visionConfig.gpuMode
    };
  }

  healthCheck(): HealthStatus {
    return this.isLoaded ? 'HEALTHY' : 'DEGRADED';
  }
}

export const modelManager = new ModelManager();
