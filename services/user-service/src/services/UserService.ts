import { canManageRole, getPermissionsForRole, Permission } from '@sentinel-ai/security';
import { UserRole } from '@sentinel-ai/types';
import { generateUuid } from '@sentinel-ai/utils';
import { isValidEmail } from '@sentinel-ai/validation';
import { UserCache } from '../cache/UserCache';
import { getUserServiceConfig, UserServiceConfig } from '../config/user-config';
import { UserRepository } from '../db/UserRepository';
import { UserEventPublisher } from '../events/UserEventPublisher';
import {
  AssignPermissionDto,
  AssignRoleDto,
  CreateUserDto,
  UpdatePreferencesDto,
  UpdateUserDto,
  UserAccountStatus,
  UserEntity,
  UserInstitutionEntity,
  UserPermissionEntity,
  UserPreferenceEntity,
  UserResponseDto,
  UserRoleEntity,
  UserSearchQueryDto
} from '../types/user';

export class UserService {
  private readonly repository: UserRepository;
  private readonly cache: UserCache;
  private readonly eventPublisher: UserEventPublisher;
  private readonly config: UserServiceConfig;

  constructor(
    repository?: UserRepository,
    cache?: UserCache,
    eventPublisher?: UserEventPublisher,
    config?: UserServiceConfig
  ) {
    this.repository = repository || new UserRepository();
    this.config = config || getUserServiceConfig();
    this.cache = cache || new UserCache(this.config.cacheTtlSeconds);
    this.eventPublisher = eventPublisher || new UserEventPublisher();
  }

  public getRepository(): UserRepository {
    return this.repository;
  }

  public getCache(): UserCache {
    return this.cache;
  }

  // --- 1. USER PROFILE CREATION ---
  public async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    if (!isValidEmail(dto.email)) {
      throw new Error('USER_INVALID_EMAIL: Email address format is invalid');
    }

    const existing = await this.repository.findUserByEmail(dto.email);
    if (existing) {
      throw new Error('USER_EMAIL_EXISTS: A user with this email address already exists');
    }

    const userId = generateUuid();
    const now = new Date().toISOString();
    const role: UserRole = dto.role || 'CANDIDATE';

    const user: UserEntity = {
      userId,
      email: dto.email.toLowerCase(),
      fullName: dto.fullName,
      avatarUrl: this.config.defaultAvatarUrl,
      phoneNumber: dto.phoneNumber || null,
      role,
      status: 'ACTIVE',
      institutionId: dto.institutionId,
      accommodations: dto.accommodations || [],
      metadata: dto.metadata || {},
      createdAt: now,
      updatedAt: now
    };

    await this.repository.createUser(user);

    // Provision default preferences
    const preferences: UserPreferenceEntity = {
      preferenceId: generateUuid(),
      userId,
      theme: 'SYSTEM',
      language: 'en-US',
      timezone: 'UTC',
      emailNotifications: true,
      smsNotifications: false,
      inAppAlerts: true,
      highContrastMode: false,
      fontSize: 'MEDIUM',
      updatedAt: now
    };
    await this.repository.savePreferences(preferences);

    // Provision institution membership
    const membership: UserInstitutionEntity = {
      membershipId: generateUuid(),
      userId,
      institutionId: dto.institutionId,
      institutionSlug: dto.institutionSlug || 'default',
      department: dto.department || null,
      title: null,
      joinedAt: now,
      isPrimary: true
    };
    await this.repository.addInstitution(membership);

    await this.eventPublisher.publishUserCreated(user);

    return this.getUserById(userId);
  }

  // --- 2. GET USER PROFILE ---
  public async getUserById(userId: string): Promise<UserResponseDto> {
    // Check Cache
    const cachedProfile = this.cache.getProfile(userId);
    if (cachedProfile) return cachedProfile;

    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`USER_NOT_FOUND: User with ID ${userId} does not exist`);
    }

    const preferences = (await this.repository.getPreferences(userId)) || undefined;
    const institutions = await this.repository.getUserInstitutions(userId);
    const effectivePermissions = await this.getEffectivePermissions(userId, user.role);

    const response: UserResponseDto = {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      institutionId: user.institutionId,
      accommodations: user.accommodations,
      metadata: user.metadata,
      preferences,
      institutions,
      effectivePermissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    this.cache.setProfile(userId, response);
    return response;
  }

  // --- 3. UPDATE USER PROFILE ---
  public async updateUser(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`USER_NOT_FOUND: User with ID ${userId} does not exist`);
    }

    const updatedUser = await this.repository.updateUser(userId, {
      fullName: dto.fullName !== undefined ? dto.fullName : user.fullName,
      phoneNumber: dto.phoneNumber !== undefined ? dto.phoneNumber : user.phoneNumber,
      avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl,
      accommodations: dto.accommodations !== undefined ? dto.accommodations : user.accommodations,
      metadata: dto.metadata !== undefined ? { ...user.metadata, ...dto.metadata } : user.metadata
    });

    this.cache.invalidateUser(userId);
    await this.eventPublisher.publishUserUpdated(updatedUser);

    return this.getUserById(userId);
  }

  // --- 4. DELETE USER ---
  public async deleteUser(userId: string): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`USER_NOT_FOUND: User with ID ${userId} does not exist`);
    }

    await this.repository.deleteUser(userId);
    this.cache.invalidateUser(userId);
    await this.eventPublisher.publishUserDeleted(userId);
  }

  // --- 5. PREFERENCES ---
  public async getPreferences(userId: string): Promise<UserPreferenceEntity> {
    const cached = this.cache.getPreferences(userId);
    if (cached) return cached;

    let pref = await this.repository.getPreferences(userId);
    if (!pref) {
      pref = {
        preferenceId: generateUuid(),
        userId,
        theme: 'SYSTEM',
        language: 'en-US',
        timezone: 'UTC',
        emailNotifications: true,
        smsNotifications: false,
        inAppAlerts: true,
        highContrastMode: false,
        fontSize: 'MEDIUM',
        updatedAt: new Date().toISOString()
      };
      await this.repository.savePreferences(pref);
    }

    this.cache.setPreferences(userId, pref);
    return pref;
  }

  public async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserPreferenceEntity> {
    const current = await this.getPreferences(userId);

    const updated: UserPreferenceEntity = {
      ...current,
      ...dto,
      updatedAt: new Date().toISOString()
    };

    await this.repository.savePreferences(updated);
    this.cache.setPreferences(userId, updated);
    this.cache.invalidateProfile(userId);

    await this.eventPublisher.publishUserPreferenceChanged(userId, updated);
    return updated;
  }

  // --- 6. ROLE MANAGEMENT ---
  public async assignRole(
    targetUserId: string,
    roleDto: AssignRoleDto,
    actorUserId: string,
    actorRole: UserRole
  ): Promise<UserResponseDto> {
    const targetUser = await this.repository.findUserById(targetUserId);
    if (!targetUser) {
      throw new Error(`USER_NOT_FOUND: Target user ${targetUserId} does not exist`);
    }

    // Role Hierarchy Enforcement
    if (!canManageRole(actorRole, roleDto.role)) {
      throw new Error(
        `USER_FORBIDDEN_ROLE_ASSIGNMENT: Role ${actorRole} cannot assign role ${roleDto.role}`
      );
    }

    const oldRole = targetUser.role;
    const assignment: UserRoleEntity = {
      roleAssignmentId: generateUuid(),
      userId: targetUserId,
      role: roleDto.role,
      assignedBy: actorUserId,
      assignedAt: new Date().toISOString(),
      reason: roleDto.reason || null
    };

    await this.repository.addRoleAssignment(assignment);
    this.cache.invalidateUser(targetUserId);

    await this.eventPublisher.publishUserRoleChanged({
      userId: targetUserId,
      oldRole,
      newRole: roleDto.role,
      assignedBy: actorUserId,
      reason: roleDto.reason
    });

    return this.getUserById(targetUserId);
  }

  // --- 7. PERMISSION OVERRIDES ---
  public async assignPermissionOverride(
    targetUserId: string,
    permDto: AssignPermissionDto,
    actorUserId: string
  ): Promise<Permission[]> {
    const targetUser = await this.repository.findUserById(targetUserId);
    if (!targetUser) {
      throw new Error(`USER_NOT_FOUND: Target user ${targetUserId} does not exist`);
    }

    const permEntity: UserPermissionEntity = {
      permissionId: generateUuid(),
      userId: targetUserId,
      permission: permDto.permission,
      isGranted: permDto.isGranted,
      grantedBy: actorUserId,
      grantedAt: new Date().toISOString()
    };

    await this.repository.setPermission(permEntity);
    this.cache.invalidatePermissions(targetUserId);
    this.cache.invalidateProfile(targetUserId);

    return this.getEffectivePermissions(targetUserId, targetUser.role);
  }

  public async getEffectivePermissions(userId: string, role?: UserRole): Promise<Permission[]> {
    const cached = this.cache.getPermissions(userId);
    if (cached) return cached;

    let targetRole = role;
    if (!targetRole) {
      const user = await this.repository.findUserById(userId);
      if (!user) return [];
      targetRole = user.role;
    }

    const basePermissions = getPermissionsForRole(targetRole);
    const overrides = await this.repository.getUserPermissionOverrides(userId);

    const permissionSet = new Set<Permission>(basePermissions);

    for (const override of overrides) {
      if (override.isGranted) {
        permissionSet.add(override.permission);
      } else {
        permissionSet.delete(override.permission);
      }
    }

    const result = Array.from(permissionSet);
    this.cache.setPermissions(userId, result);
    return result;
  }

  // --- 8. ACCOUNT STATUS & ADMINISTRATIVE MANAGEMENT ---
  public async updateAccountStatus(
    targetUserId: string,
    newStatus: UserAccountStatus,
    actorUserId: string
  ): Promise<UserResponseDto> {
    const targetUser = await this.repository.findUserById(targetUserId);
    if (!targetUser) {
      throw new Error(`USER_NOT_FOUND: Target user ${targetUserId} does not exist`);
    }

    await this.repository.updateUser(targetUserId, { status: newStatus });
    this.cache.invalidateUser(targetUserId);

    if (newStatus === 'ACTIVE') {
      await this.eventPublisher.publishUserActivated(targetUserId);
    } else if (newStatus === 'DEACTIVATED' || newStatus === 'SUSPENDED') {
      await this.eventPublisher.publishUserDeactivated(targetUserId);
    }

    return this.getUserById(targetUserId);
  }

  // --- 9. INSTITUTION MEMBERSHIP ---
  public async addInstitutionMembership(
    userId: string,
    institutionId: string,
    institutionSlug: string,
    department?: string,
    title?: string,
    isPrimary: boolean = false
  ): Promise<UserInstitutionEntity[]> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`USER_NOT_FOUND: User ${userId} does not exist`);
    }

    const membership: UserInstitutionEntity = {
      membershipId: generateUuid(),
      userId,
      institutionId,
      institutionSlug,
      department: department || null,
      title: title || null,
      joinedAt: new Date().toISOString(),
      isPrimary
    };

    await this.repository.addInstitution(membership);
    this.cache.invalidateProfile(userId);
    return this.repository.getUserInstitutions(userId);
  }

  // --- 10. USER SEARCH ---
  public async searchUsers(queryDto: UserSearchQueryDto): Promise<{ items: UserResponseDto[]; total: number }> {
    const { items, total } = await this.repository.searchUsers(queryDto);

    const userResponses: UserResponseDto[] = [];
    for (const u of items) {
      userResponses.push(await this.getUserById(u.userId));
    }

    return { items: userResponses, total };
  }
}
