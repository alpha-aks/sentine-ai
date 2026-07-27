import {
  FaceAnalysisResult,
  FramePayload,
  ObjectDetectionResult
} from '../types/vision.types';
import { HeadPoseEstimator } from './head-pose-estimator';

export class FaceAnalyzer {
  private headPoseEstimator = new HeadPoseEstimator();
  private lastSessionFaceCounts = new Map<string, number>();

  public analyze(frame: FramePayload, detections: ObjectDetectionResult[]): FaceAnalysisResult {
    let faceCount = 0;

    if (frame.simulatedFaceCount !== undefined) {
      faceCount = frame.simulatedFaceCount;
    } else {
      const faceDetections = detections.filter((d) => d.label === 'face');
      const personDetections = detections.filter((d) => d.label === 'person');
      faceCount = Math.max(faceDetections.length, personDetections.length);
    }

    const previousCount = this.lastSessionFaceCounts.get(frame.candidateSessionId) ?? 1;
    this.lastSessionFaceCounts.set(frame.candidateSessionId, faceCount);

    const isLeavingFrame = previousCount > 0 && faceCount === 0;
    const isReentering = previousCount === 0 && faceCount > 0;

    const headPose = this.headPoseEstimator.estimatePose(frame.simulatedHeadPose);

    const faces = [];
    for (let i = 0; i < faceCount; i++) {
      faces.push({
        bbox: {
          x: 200 + i * 150,
          y: 100,
          width: 150,
          height: 150
        },
        confidence: 0.95,
        headPose: i === 0 ? headPose : this.headPoseEstimator.estimatePose({ yaw: 0, pitch: 0, roll: 0 })
      });
    }

    return {
      faceCount,
      primaryFaceDetected: faceCount > 0,
      faces,
      isLeavingFrame,
      isReentering
    };
  }
}
