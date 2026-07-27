import { Request, Response } from 'express';
import { visionGuardService } from '../services/vision-guard.service';

export class VisionFoundationController {
  public async getHealth(_req: Request, res: Response): Promise<void> {
    const health = visionGuardService.getHealthSummary();
    const statusCode = health.status === 'HEALTHY' ? 200 : 503;
    res.status(statusCode).json(health);
  }

  public async getStatus(_req: Request, res: Response): Promise<void> {
    const status = visionGuardService.getStatus();
    res.json({
      success: true,
      data: status
    });
  }

  public async getMetrics(_req: Request, res: Response): Promise<void> {
    const metrics = visionGuardService.getMetrics();
    res.json({
      success: true,
      data: metrics
    });
  }

  public async getConfig(_req: Request, res: Response): Promise<void> {
    const config = visionGuardService.getConfig();
    res.json({
      success: true,
      data: config
    });
  }
}

export const visionFoundationController = new VisionFoundationController();
