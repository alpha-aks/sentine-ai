import { HeadOrientation, HeadPoseVector } from '../types/vision.types';

export class HeadPoseEstimator {
  private yawThreshold = 22; // Degrees threshold for left/right
  private pitchThreshold = 18; // Degrees threshold for up/down

  public estimatePose(rawPose?: Partial<HeadPoseVector>): HeadPoseVector {
    const pitch = rawPose?.pitch ?? 0;
    const yaw = rawPose?.yaw ?? 0;
    const roll = rawPose?.roll ?? 0;

    let orientation: HeadOrientation = 'FORWARD';

    if (Math.abs(yaw) > 35 || Math.abs(pitch) > 30) {
      orientation = 'LOOKING_AWAY';
    } else if (yaw < -this.yawThreshold) {
      orientation = 'LOOKING_LEFT';
    } else if (yaw > this.yawThreshold) {
      orientation = 'LOOKING_RIGHT';
    } else if (pitch > this.pitchThreshold) {
      orientation = 'LOOKING_DOWN';
    } else if (pitch < -this.pitchThreshold) {
      orientation = 'LOOKING_UP';
    }

    return {
      pitch,
      yaw,
      roll,
      orientation
    };
  }
}
