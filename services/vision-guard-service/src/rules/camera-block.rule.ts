import { FramePayload, ObjectDetectionResult, FaceAnalysisResult } from '../types/vision.types';

export class CameraBlockRule {
  public evaluate(
    frame: FramePayload,
    detections: ObjectDetectionResult[],
    faceAnalysis: FaceAnalysisResult
  ): string[] {
    const events: string[] = [];

    if (frame.simulatedObjects) {
      if (frame.simulatedObjects.includes('camera_blocked') || frame.simulatedObjects.includes('camera-blocked')) {
        events.push('CAMERA_BLOCKED');
      }
      if (frame.simulatedObjects.includes('camera_lost') || frame.simulatedObjects.includes('camera-lost') || frame.simulatedObjects.includes('camera_disconnected')) {
        events.push('CAMERA_LOST');
      }
    }

    return events;
  }
}
