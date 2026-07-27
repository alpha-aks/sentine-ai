import { ObjectDetectionResult } from '../types/vision.types';

export class ConfidenceFilter {
  private windowSize = 5;
  // Map of candidateSessionId -> label -> confidence history array
  private history = new Map<string, Map<string, number[]>>();

  public filter(
    sessionId: string,
    detections: ObjectDetectionResult[],
    threshold: number
  ): ObjectDetectionResult[] {
    let sessionMap = this.history.get(sessionId);
    if (!sessionMap) {
      sessionMap = new Map<string, number[]>();
      this.history.set(sessionId, sessionMap);
    }

    const confirmedDetections: ObjectDetectionResult[] = [];

    // Collect all unique labels in this frame's detections
    const frameLabels = new Set<string>();
    for (const det of detections) {
      if (det.label) frameLabels.add(det.label);
    }

    // Get all labels seen historically plus in this frame
    const allLabels = new Set([...sessionMap.keys(), ...frameLabels]);

    for (const label of allLabels) {
      let window = sessionMap.get(label);
      if (!window) {
        window = [];
        sessionMap.set(label, window);
      }

      const detection = detections.find((d) => d.label === label);
      const currentConf = detection?.confidence ?? 0;

      window.push(currentConf);
      if (window.length > this.windowSize) {
        window.shift();
      }

      const avgConf = window.reduce((a, b) => a + b, 0) / window.length;

      // If the moving average passes the threshold and the label is currently detected, confirm it
      if (avgConf >= threshold && detection) {
        confirmedDetections.push({
          ...detection,
          confidence: avgConf
        });
      }
    }

    return confirmedDetections;
  }
}
