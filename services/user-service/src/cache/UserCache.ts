import { Permission } from '@sentinel-ai/security';
import { UserPreferenceEntity, UserResponseDto } from '../types/user';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class UserCache {
  private profileCache: Map<string, CacheEntry<UserResponseDto>> = new Map();
  private preferenceCache: Map<string, CacheEntry<UserPreferenceEntity>> = new Map();
  private permissionCache: Map<string, CacheEntry<Permission[]>> = new Map();
  private readonly defaultTtlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.defaultTtlMs = ttlSeconds * 1000;
  }

  // --- Profile Cache ---
  public getProfile(userId: string): UserResponseDto | null {
    const entry = this.profileCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.profileCache.delete(userId);
      return null;
    }
    return { ...entry.data };
  }

  public setProfile(userId: string, profile: UserResponseDto, ttlMs?: number): void {
    this.profileCache.set(userId, {
      data: { ...profile },
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs)
    });
  }

  public invalidateProfile(userId: string): void {
    this.profileCache.delete(userId);
  }

  // --- Preference Cache ---
  public getPreferences(userId: string): UserPreferenceEntity | null {
    const entry = this.preferenceCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.preferenceCache.delete(userId);
      return null;
    }
    return { ...entry.data };
  }

  public setPreferences(userId: string, preferences: UserPreferenceEntity, ttlMs?: number): void {
    this.preferenceCache.set(userId, {
      data: { ...preferences },
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs)
    });
  }

  public invalidatePreferences(userId: string): void {
    this.preferenceCache.delete(userId);
  }

  // --- Permission Cache ---
  public getPermissions(userId: string): Permission[] | null {
    const entry = this.permissionCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.permissionCache.delete(userId);
      return null;
    }
    return [...entry.data];
  }

  public setPermissions(userId: string, permissions: Permission[], ttlMs?: number): void {
    this.permissionCache.set(userId, {
      data: [...permissions],
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs)
    });
  }

  public invalidatePermissions(userId: string): void {
    this.permissionCache.delete(userId);
  }

  public invalidateUser(userId: string): void {
    this.invalidateProfile(userId);
    this.invalidatePreferences(userId);
    this.invalidatePermissions(userId);
  }

  public clear(): void {
    this.profileCache.clear();
    this.preferenceCache.clear();
    this.permissionCache.clear();
  }
}
