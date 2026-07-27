export type InferenceMode = 'CPU' | 'GPU';
export type GpuMode = 'CUDA' | 'TENSOR_RT' | 'ROCM' | 'DISABLED';
export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
export type StreamStatus = 'INITIALIZING' | 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'DEGRADED';

export type SupportedObjectClass =
  | 'person'
  | 'cell phone'
  | 'laptop'
  | 'tablet'
  | 'book'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'backpack'
  | 'hand'
  | 'face'
  | 'head'
  | 'chair'
  | string;

export type HeadOrientation =
  | 'FORWARD'
  | 'LOOKING_LEFT'
  | 'LOOKING_RIGHT'
  | 'LOOKING_UP'
  | 'LOOKING_DOWN'
  | 'LOOKING_AWAY';

export interface HeadPoseVector {
  pitch: number;
  yaw: number;
  roll: number;
  orientation: HeadOrientation;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  classId: number;
  className: string;
  confidence: number;
  box: BoundingBox;
}

export interface ObjectDetectionResult {
  label?: string;
  confidence?: number;
  bbox?: any;
  detectedObjects?: Detection[];
  objectCounts?: Record<string, number>;
  hasUnauthorizedObjects?: boolean;
  unauthorizedClassesFound?: string[];
}

export interface FaceAnalysisResult {
  faceCount: number;
  primaryFaceConfidence?: number;
  primaryFaceDetected?: boolean;
  faces?: any[];
  headPose?: HeadPoseVector;
  isLeavingFrame?: boolean;
  isReentering?: boolean;
}

export interface FramePayload {
  frameId?: string;
  candidateId: string;
  candidateSessionId: string;
  institutionId?: string;
  examId?: string;
  timestamp: string;
  width: number;
  height: number;
  frameIndex?: number;
  base64Data?: string;
  dataBuffer?: Buffer;
  simulatedObjects?: string[];
  simulatedFaceCount?: number;
  simulatedHeadPose?: { pitch?: number; yaw?: number; roll?: number };
}

export interface VisionEventPayload {
  eventId: string;
  eventType: string;
  candidateId: string;
  candidateSessionId: string;
  institutionId?: string;
  examId?: string;
  timestamp: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface VisionEvent {
  eventId: string;
  eventType: string;
  candidateId: string;
  candidateSessionId: string;
  timestamp: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface VisionObservabilityMetrics {
  currentFps: number;
  averageInferenceLatencyMs: number;
  totalFramesProcessed: number;
  totalDroppedFrames: number;
  totalEventsEmitted: number;
  gpuUtilizationPercentage: number;
  cpuUtilizationPercentage: number;
  memoryUsageMb: number;
  queueSize: number;
}

export interface VisionConfigDTO {
  serviceName: string;
  environment: string;
  port: number;
  logLevel: string;
  inferenceMode: InferenceMode;
  executionMode?: string;
  gpuEnabled: boolean;
  gpuMode: GpuMode;
  modelPath: string;
  frameQueueSize: number;
  defaultFps: number;
  defaultResolutionWidth: number;
  defaultResolutionHeight: number;
  healthIntervalMs: number;
  metricsIntervalMs: number;
  confidenceThreshold: number;
  fps: number;
  resolutionWidth: number;
  resolutionHeight: number;
  skipFrames: number;
  maxLatencyMs?: number;
}

export interface VisionMetricsDTO {
  framesProcessed: number;
  droppedFrames: number;
  inferenceCount: number;
  averageLatencyMs: number;
  queueLength: number;
  gpuUsagePercentage: number;
  cpuUsagePercentage: number;
  memoryUsageMb: number;
  activeStreamsCount: number;
  totalDetectionEvents: number;
}

export interface VisionServiceStatusDTO {
  serviceName: string;
  version: string;
  environment: string;
  status: HealthStatus;
  startupTimestamp: string;
  uptimeSeconds: number;
  activeStreams: number;
  inferenceMode: InferenceMode;
  gpuEnabled: boolean;
}
