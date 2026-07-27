import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@sentinel-ai/types';
import { AuthenticatedRequest } from '../middleware/auth-middleware';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService();
  }

  public getService(): AuthService {
    return this.authService;
  }

  private sendResponse<T>(res: Response, statusCode: number, data: T, req: Request): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    };
    res.status(statusCode).json(response);
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.register({
        email: req.body.email,
        password: req.body.password,
        fullName: req.body.fullName || req.body.full_name,
        institutionSlug: req.body.institutionSlug || req.body.institution_slug || 'default',
        role: req.body.role
      });
      this.sendResponse(res, 201, user, req);
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deviceIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'SentinelAI Client Agent';

      const authData = await this.authService.login({
        email: req.body.email,
        password: req.body.password,
        institution_slug: req.body.institution_slug || req.body.institutionSlug,
        deviceIp,
        userAgent
      });

      this.sendResponse(res, 200, authData, req);
    } catch (err) {
      next(err);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshTokenStr = req.body.refreshToken || req.body.refresh_token;
      const authData = await this.authService.refreshToken(refreshTokenStr);
      this.sendResponse(res, 200, authData, req);
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.sub;
      const sessionId = req.user?.sessionId;
      const refreshTokenStr = req.body.refreshToken || req.body.refresh_token;

      if (userId && sessionId) {
        await this.authService.logout(userId, sessionId, refreshTokenStr);
      }

      this.sendResponse(res, 200, { message: 'Logged out successfully' }, req);
    } catch (err) {
      next(err);
    }
  };

  public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.body.token || req.query.token;
      const user = await this.authService.verifyEmail({ token: String(token) });
      this.sendResponse(res, 200, user, req);
    } catch (err) {
      next(err);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.forgotPassword({ email: req.body.email });
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.resetPassword({
        token: req.body.token,
        newPassword: req.body.newPassword || req.body.new_password
      });
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };

  public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const result = await this.authService.changePassword(userId, {
        currentPassword: req.body.currentPassword || req.body.current_password,
        newPassword: req.body.newPassword || req.body.new_password
      });
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };

  public verifyMfa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.verifyMfa({
        userId: req.body.userId || req.body.user_id,
        code: req.body.code
      });
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };

  public getSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const sessions = await this.authService.getUserSessions(userId);
      this.sendResponse(res, 200, { sessions }, req);
    } catch (err) {
      next(err);
    }
  };

  public revokeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const sessionId = req.params.sessionId;
      await this.authService.revokeSession(userId, sessionId);
      this.sendResponse(res, 200, { message: `Session ${sessionId} revoked` }, req);
    } catch (err) {
      next(err);
    }
  };

  public revokeAllSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      await this.authService.revokeAllSessions(userId);
      this.sendResponse(res, 200, { message: 'All active sessions revoked' }, req);
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const user = await this.authService.getRepository().findUserById(userId);
      if (!user) {
        throw new Error('AUTH_USER_NOT_FOUND: User profile not found');
      }
      this.sendResponse(
        res,
        200,
        {
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          institutionId: user.institutionId,
          institutionSlug: user.institutionSlug,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaEnabled,
          status: user.status,
          createdAt: user.createdAt
        },
        req
      );
    } catch (err) {
      next(err);
    }
  };
}
