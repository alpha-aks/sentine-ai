export type CameraHealthStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'BLOCKED'
  | 'LOST'
  | 'LOW_FPS'
  | 'POOR_QUALITY'
  | 'STREAMING'
  | 'WAITING'
  | 'INITIALIZING';

export type VisionEventType =
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'SECOND_PERSON'
  | 'PHONE_DETECTED'
  | 'LOOKING_AWAY'
  | 'CAMERA_BLOCKED'
  | 'CAMERA_LOST'
  | 'OBJECT_DETECTED'
  | 'FACE_RETURNED'
  | 'HEAD_MOVEMENT';

export type WarningMode = 'BANNER' | 'POPUP' | 'SILENT';

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

export interface CameraResolution {
  width: number;
  height: number;
  label: string;
}

export interface HeadPoseData {
  pitch: number;
  yaw: number;
  roll: number;
  orientation: 'FORWARD' | 'LOOKING_LEFT' | 'LOOKING_RIGHT' | 'LOOKING_UP' | 'LOOKING_DOWN' | 'LOOKING_AWAY';
}

export interface VisionEventRecord {
  eventId: string;
  eventType: VisionEventType;
  candidateId: string;
  candidateSessionId: string;
  timestamp: string;
  confidence: number;
  metadata?: {
    objectClass?: string;
    faceCount?: number;
    headPose?: HeadPoseData;
    frameIndex?: number;
    frameReference?: string;
  };
}

export interface VisionHealthMetrics {
  currentFps: number;
  averageInferenceLatencyMs: number;
  totalFramesProcessed: number;
  totalDroppedFrames: number;
  totalEventsEmitted: number;
  gpuUtilizationPercentage?: number;
  cpuUtilizationPercentage: number;
  memoryUsageMb: number;
  queueSize: number;
}
