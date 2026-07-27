import { Request, Response, NextFunction } from 'express';
import { ApiResponse, UserRole } from '@sentinel-ai/types';
import { AuthenticatedRequest } from '../middleware/auth-middleware';
import { UserService } from '../services/UserService';

export class UserController {
  private readonly userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || new UserService();
  }

  public getService(): UserService {
    return this.userService;
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

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser({
        email: req.body.email,
        fullName: req.body.fullName || req.body.full_name,
        role: req.body.role,
        institutionId: req.body.institutionId || req.body.institution_id || 'inst_default',
        institutionSlug: req.body.institutionSlug || req.body.institution_slug,
        department: req.body.department,
        phoneNumber: req.body.phoneNumber || req.body.phone_number,
        accommodations: req.body.accommodations,
        metadata: req.body.metadata
      });
      this.sendResponse(res, 201, user, req);
    } catch (err) {
      next(err);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      const user = await this.userService.getUserById(userId);
      this.sendResponse(res, 200, user, req);
    } catch (err) {
      next(err);
    }
  };

  public getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const user = await this.userService.getUserById(userId);
      this.sendResponse(res, 200, user, req);
    } catch (err) {
      next(err);
    }
  };

  public updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user!.sub;
      const user = await this.userService.updateUser(userId, {
        fullName: req.body.fullName || req.body.full_name,
        phoneNumber: req.body.phoneNumber || req.body.phone_number,
        avatarUrl: req.body.avatarUrl || req.body.avatar_url,
        accommodations: req.body.accommodations,
        metadata: req.body.metadata
      });
      this.sendResponse(res, 200, user, req);
    } catch (err) {
      next(err);
    }
  };

  public deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      await this.userService.deleteUser(userId);
      this.sendResponse(res, 200, { message: `User ${userId} deleted successfully` }, req);
    } catch (err) {
      next(err);
    }
  };

  public getPreferences = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user!.sub;
      const preferences = await this.userService.getPreferences(userId);
      this.sendResponse(res, 200, preferences, req);
    } catch (err) {
      next(err);
    }
  };

  public updatePreferences = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user!.sub;
      const updated = await this.userService.updatePreferences(userId, req.body);
      this.sendResponse(res, 200, updated, req);
    } catch (err) {
      next(err);
    }
  };

  public assignRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetUserId = req.params.userId;
      const actorUserId = req.user!.sub;
      const actorRole = req.user!.role as UserRole;

      const user = await this.userService.assignRole(
        targetUserId,
        {
          role: req.body.role,
          reason: req.body.reason
        },
        actorUserId,
        actorRole
      );

      this.sendResponse(res, 200, user, req);
    } catch (err) {
      next(err);
    }
  };

  public assignPermissionOverride = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const targetUserId = req.params.userId;
      const actorUserId = req.user!.sub;

      const permissions = await this.userService.assignPermissionOverride(
        targetUserId,
        {
          permission: req.body.permission,
          isGranted: req.body.isGranted ?? req.body.is_granted ?? true
        },
        actorUserId
      );

      this.sendResponse(res, 200, { effectivePermissions: permissions }, req);
    } catch (err) {
      next(err);
    }
  };

  public getEffectivePermissions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId || req.user!.sub;
      const permissions = await this.userService.getEffectivePermissions(userId);
      this.sendResponse(res, 200, { effectivePermissions: permissions }, req);
    } catch (err) {
      next(err);
    }
  };

  public updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetUserId = req.params.userId;
      const actorUserId = req.user!.sub;
      const newStatus = req.body.status;

      const user = await this.userService.updateAccountStatus(targetUserId, newStatus, actorUserId);
      this.sendResponse(res, 200, user, req);
    } catch (err) {
      next(err);
    }
  };

  public addInstitutionMembership = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId;
      const memberships = await this.userService.addInstitutionMembership(
        userId,
        req.body.institutionId || req.body.institution_id,
        req.body.institutionSlug || req.body.institution_slug || 'default',
        req.body.department,
        req.body.title,
        req.body.isPrimary ?? req.body.is_primary ?? false
      );
      this.sendResponse(res, 200, { institutions: memberships }, req);
    } catch (err) {
      next(err);
    }
  };

  public searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryDto = {
        query: req.query.q as string,
        role: req.query.role as UserRole,
        institutionId: req.query.institutionId as string,
        status: req.query.status as any,
        page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any
      };

      const result = await this.userService.searchUsers(queryDto);
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };
}
