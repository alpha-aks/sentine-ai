import { FramePayload, ObjectDetectionResult, FaceAnalysisResult } from '../types/vision.types';

export class LookingAwayRule {
  private lastSessionOrientation = new Map<string, string>();

  public evaluate(
    frame: FramePayload,
    detections: ObjectDetectionResult[],
    faceAnalysis: FaceAnalysisResult
  ): string[] {
    const events: string[] = [];

    const orientation = faceAnalysis.headPose?.orientation || 'FORWARD';

    if (orientation !== 'FORWARD') {
      events.push('LOOKING_AWAY');
    }

    const previous = this.lastSessionOrientation.get(frame.candidateSessionId);
    if (previous !== undefined && previous !== orientation) {
      events.push('HEAD_MOVEMENT');
    }

    this.lastSessionOrientation.set(frame.candidateSessionId, orientation);

    return events;
  }
}
