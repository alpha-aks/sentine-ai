import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { VisionGuardService } from '../services/vision-guard.service';
import { FramePayload } from '../types/vision.types';

export class VisionController {
  private service = VisionGuardService.getInstance();

  public getHealth = (req: AuthenticatedRequest, res: Response) => {
    return res.status(200).json({
      status: 'UP',
      service: 'vision-guard-service',
      timestamp: new Date().toISOString()
    });
  };

  public getStatus = (req: AuthenticatedRequest, res: Response) => {
    const config = this.service.getConfig();
    return res.status(200).json({
      success: true,
      data: {
        activeStreams: this.service.getActiveStreamCount(),
        currentModel: config.modelPath,
        executionMode: config.executionMode,
        targetFps: config.fps,
        maxLatencyMs: config.maxLatencyMs,
        tenantId: req.tenantId || 'inst_mit_01'
      }
    });
  };

  public getConfig = (req: AuthenticatedRequest, res: Response) => {
    const config = this.service.getConfig();
    return res.status(200).json({
      success: true,
      data: config
    });
  };

  public updateConfig = (req: AuthenticatedRequest, res: Response) => {
    const updates = req.body || {};
    const updatedConfig = this.service.updateConfig(updates);
    return res.status(200).json({
      success: true,
      data: updatedConfig
    });
  };

  public getMetrics = (req: AuthenticatedRequest, res: Response) => {
    const metrics = this.service.getObservabilityMetrics();
    return res.status(200).json({
      success: true,
      data: metrics
    });
  };

  public startStream = (req: AuthenticatedRequest, res: Response) => {
    const { candidateSessionId, candidateId } = req.body;
    if (!candidateSessionId || !candidateId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'candidateSessionId and candidateId are required' }
      });
    }

    const result = this.service.startStream(candidateSessionId);
    return res.status(200).json({
      success: true,
      data: result
    });
  };

  public stopStream = (req: AuthenticatedRequest, res: Response) => {
    const { candidateSessionId } = req.body;
    if (!candidateSessionId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'candidateSessionId is required' }
      });
    }

    const result = this.service.stopStream(candidateSessionId);
    return res.status(200).json({
      success: true,
      data: result
    });
  };

  public processFrame = async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as Partial<FramePayload>;

    if (!body.candidateSessionId || !body.candidateId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FRAME_PAYLOAD', message: 'candidateSessionId and candidateId are required' }
      });
    }

    const frame: FramePayload = {
      candidateId: body.candidateId,
      candidateSessionId: body.candidateSessionId,
      institutionId: req.tenantId || body.institutionId || 'inst_mit_01',
      examId: body.examId,
      timestamp: body.timestamp || new Date().toISOString(),
      frameIndex: body.frameIndex || 1,
      width: body.width || 1280,
      height: body.height || 720,
      base64Data: body.base64Data,
      simulatedObjects: body.simulatedObjects,
      simulatedFaceCount: body.simulatedFaceCount,
      simulatedHeadPose: body.simulatedHeadPose
    };

    const result = await this.service.processFrame(frame);
    return res.status(200).json({
      success: true,
      data: result
    });
  };
}
