import { FramePayload, ObjectDetectionResult, FaceAnalysisResult } from '../types/vision.types';

export class PhoneRule {
  private deviceLabels = new Set(['cell phone', 'laptop', 'tablet']);
  private suspiciousLabels = new Set(['book', 'backpack', 'monitor', 'keyboard', 'mouse', 'chair']);

  public evaluate(
    frame: FramePayload,
    detections: ObjectDetectionResult[],
    faceAnalysis: FaceAnalysisResult
  ): string[] {
    const events: string[] = [];

    const hasPhone = detections.some((d) => this.deviceLabels.has(d.label || ''));
    if (hasPhone) {
      events.push('PHONE_DETECTED');
    }

    const hasSuspiciousObject = detections.some((d) => this.suspiciousLabels.has(d.label || ''));
    if (hasSuspiciousObject) {
      events.push('OBJECT_DETECTED');
    }

    return events;
  }
}
