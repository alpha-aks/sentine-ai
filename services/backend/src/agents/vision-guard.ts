import { TelemetryVector, VisionSignal } from '@sentinel-ai/types';

export class VisionGuardAgent {
  public processFrame(telemetry: TelemetryVector): VisionSignal {
    const gazeX = telemetry.gazeX ?? 0;
    const gazeY = telemetry.gazeY ?? 0;
    const headYaw = Math.abs(telemetry.headYaw ?? 0);
    const personCount = telemetry.personCount ?? 1;
    const detectedObjects = telemetry.detectedObjects ?? [];

    // Gaze offscreen evaluation: gaze offset > 0.65 or head yaw > 35 degrees
    const offscreenGazeFlag = Math.abs(gazeX) > 0.65 || Math.abs(gazeY) > 0.65 || headYaw > 35;
    const headPoseAnomaly = headYaw > 45;
    const cameraTamperFlag = personCount === 0;

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
