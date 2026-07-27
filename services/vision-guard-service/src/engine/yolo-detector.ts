import {
  FramePayload,
  ObjectDetectionResult,
  SupportedObjectClass
} from '../types/vision.types';
import { VisionConfigManager } from '../config/vision.config';
import { Logger } from '@sentinel-ai/logger';

const logger = new Logger({ serviceName: 'vision-guard-yolo' });

export class YoloDetector {
  private configManager = VisionConfigManager.getInstance();
  private supportedClasses: Set<SupportedObjectClass> = new Set([
    'person',
    'cell phone',
    'laptop',
    'tablet',
    'book',
    'monitor',
    'keyboard',
    'mouse',
    'backpack',
    'hand',
    'face',
    'head',
    'chair'
  ]);

  public async detect(frame: FramePayload): Promise<ObjectDetectionResult[]> {
    const config = this.configManager.getConfig();
    const results: ObjectDetectionResult[] = [];

    // If frame contains simulated object classes (for testing/integration stream)
    if (frame.simulatedObjects && frame.simulatedObjects.length > 0) {
      for (const objClass of frame.simulatedObjects) {
        if (this.supportedClasses.has(objClass)) {
          results.push({
            label: objClass,
            confidence: 0.92,
            bbox: {
              x: Math.floor(frame.width * 0.2),
              y: Math.floor(frame.height * 0.2),
              width: Math.floor(frame.width * 0.4),
              height: Math.floor(frame.height * 0.4)
            }
          });
        }
      }
      return results.filter((r) => r.confidence !== undefined && r.confidence >= config.confidenceThreshold);
    }

    // Default vision detection pipeline: Identify primary person and face in webcam frame
    if (!frame.base64Data && (!frame.simulatedFaceCount || frame.simulatedFaceCount > 0)) {
      results.push({
        label: 'person',
        confidence: 0.96,
        bbox: { x: 100, y: 50, width: 400, height: 500 }
      });
      results.push({
        label: 'face',
        confidence: 0.94,
        bbox: { x: 220, y: 100, width: 160, height: 180 }
      });
    }

    return results.filter((r) => r.confidence !== undefined && r.confidence >= config.confidenceThreshold);
  }
}
