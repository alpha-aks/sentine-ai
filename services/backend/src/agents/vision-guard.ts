import { TelemetryVector, VisionSignal } from '@sentinel-ai/types';

export class VisionGuardAgent {
  public processFrame(telemetry: TelemetryVector): VisionSignal {
    const gazeX = telemetry.gazeX ?? 0;
    const gazeY = telemetry.gazeY ?? 0;
    const headYaw = Math.abs(telemetry.headYaw ?? 0);
    const personCount = telemetry.personCount ?? 1;
    const detectedObjects = telemetry.detectedObjects ?? [];
    const cameraBlocked = telemetry.cameraBlocked ?? false;
    const cameraLost = telemetry.cameraLost ?? false;
    const frameFreezeDetected = telemetry.frameFreezeDetected ?? false;

    // Gaze evaluation: Downward gaze (gazeY > 0 up to 0.75) is permissible for typing/reading
    // Looking away horizontally (|gazeX| > 0.55), far up (gazeY < -0.55), or head yaw > 32 is flagged
    const offscreenGazeFlag = Math.abs(gazeX) > 0.55 || gazeY < -0.55 || gazeY > 0.85 || headYaw > 32;
    const headPoseAnomaly = headYaw > 40;
    const cameraTamperFlag = personCount === 0 || cameraBlocked || cameraLost || frameFreezeDetected;


    // Detect secondary electronics or unauthorized material
    const detectedDevices = detectedObjects.filter((obj: string) => 
      ['smartphone', 'tablet', 'smartwatch', 'secondary_monitor', 'book'].includes(obj)
    );

    // Calculate agent confidence score (0.00 to 1.00)
    let confidence = 0.95;
    if (cameraTamperFlag) confidence = 0.98;
    else if (detectedDevices.length > 0) confidence = 0.96;
    else if (personCount > 1) confidence = 0.94;
    else if (offscreenGazeFlag) confidence = 0.88;

    return {
      agentId: 'VISION_GUARD',
      timestamp: telemetry.timestamp,
      confidence,
      offscreenGazeFlag,
      headPoseAnomaly,
      personCount,
      detectedDevices,
      cameraTamperFlag
    };
  }
}
