import { FramePayload, ObjectDetectionResult, FaceAnalysisResult } from '../types/vision.types';

export class NoFaceRule {
  public evaluate(
    frame: FramePayload,
    detections: ObjectDetectionResult[],
    faceAnalysis: FaceAnalysisResult
  ): string[] {
    const events: string[] = [];

    if (faceAnalysis.faceCount === 0) {
      events.push('NO_FACE');
    }

    if (faceAnalysis.isReentering) {
      events.push('FACE_RETURNED');
    }

    return events;
  }
}
