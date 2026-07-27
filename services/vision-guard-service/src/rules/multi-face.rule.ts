import { FramePayload, ObjectDetectionResult, FaceAnalysisResult } from '../types/vision.types';

export class MultiFaceRule {
  public evaluate(
    frame: FramePayload,
    detections: ObjectDetectionResult[],
    faceAnalysis: FaceAnalysisResult
  ): string[] {
    const events: string[] = [];

    // Trigger MULTIPLE_FACES if faceCount > 1
    if (faceAnalysis.faceCount > 1) {
      events.push('MULTIPLE_FACES');
    }

    // Trigger SECOND_PERSON if faceCount > 1 OR there are multiple person detections
    const personDetections = detections.filter((d) => d.label === 'person');
    if (faceAnalysis.faceCount > 1 || personDetections.length > 1) {
      events.push('SECOND_PERSON');
    }

    return events;
  }
}
