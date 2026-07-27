import { FramePayload, ObjectDetectionResult, FaceAnalysisResult } from '../types/vision.types';
import { NoFaceRule } from './no-face.rule';
import { MultiFaceRule } from './multi-face.rule';
import { PhoneRule } from './phone.rule';
import { LookingAwayRule } from './looking-away.rule';
import { CameraBlockRule } from './camera-block.rule';

export class RuleEngine {
  private rules = [
    new NoFaceRule(),
    new MultiFaceRule(),
    new PhoneRule(),
    new LookingAwayRule(),
    new CameraBlockRule()
  ];

  public evaluate(
    frame: FramePayload,
    detections: ObjectDetectionResult[],
    faceAnalysis: FaceAnalysisResult
  ): string[] {
    const allEvents = new Set<string>();

    for (const rule of this.rules) {
      const events = rule.evaluate(frame, detections, faceAnalysis);
      for (const ev of events) {
        allEvents.add(ev);
      }
    }

    return Array.from(allEvents);
  }
}
