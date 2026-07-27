import {
  AcademicCalendarEntity,
  CourseEntity,
  DepartmentEntity,
  InstitutionBrandingEntity,
  InstitutionConfigurationEntity,
  InstitutionEntity
} from '../types/institution';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class InstitutionCache {
  private institutionCache: Map<string, CacheEntry<InstitutionEntity>> = new Map();
  private departmentCache: Map<string, CacheEntry<DepartmentEntity[]>> = new Map();
  private courseCache: Map<string, CacheEntry<CourseEntity[]>> = new Map();
  private configCache: Map<string, CacheEntry<InstitutionConfigurationEntity>> = new Map();
  private brandingCache: Map<string, CacheEntry<InstitutionBrandingEntity>> = new Map();
  private calendarCache: Map<string, CacheEntry<AcademicCalendarEntity[]>> = new Map();
  private readonly defaultTtlMs: number;

  constructor(ttlSeconds: number = 600) {
    this.defaultTtlMs = ttlSeconds * 1000;
  }

  // --- Institution Metadata Cache ---
  public getInstitution(institutionId: string): InstitutionEntity | null {
    const entry = this.institutionCache.get(institutionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.institutionCache.delete(institutionId);
      return null;
    }
    return { ...entry.data };
  }

  public setInstitution(institutionId: string, entity: InstitutionEntity): void {
    this.institutionCache.set(institutionId, {
      data: { ...entity },
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateInstitution(institutionId: string): void {
    this.institutionCache.delete(institutionId);
  }

  // --- Department Cache ---
  public getDepartments(institutionId: string): DepartmentEntity[] | null {
    const entry = this.departmentCache.get(institutionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.departmentCache.delete(institutionId);
      return null;
    }
    return [...entry.data];
  }

  public setDepartments(institutionId: string, depts: DepartmentEntity[]): void {
    this.departmentCache.set(institutionId, {
      data: [...depts],
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateDepartments(institutionId: string): void {
    this.departmentCache.delete(institutionId);
  }

  // --- Course Cache ---
  public getCourses(institutionId: string): CourseEntity[] | null {
    const entry = this.courseCache.get(institutionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.courseCache.delete(institutionId);
      return null;
    }
    return [...entry.data];
  }

  public setCourses(institutionId: string, courses: CourseEntity[]): void {
    this.courseCache.set(institutionId, {
      data: [...courses],
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateCourses(institutionId: string): void {
    this.courseCache.delete(institutionId);
  }

  // --- Configuration Cache ---
  public getConfiguration(institutionId: string): InstitutionConfigurationEntity | null {
    const entry = this.configCache.get(institutionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.configCache.delete(institutionId);
      return null;
    }
    return { ...entry.data };
  }

  public setConfiguration(institutionId: string, config: InstitutionConfigurationEntity): void {
    this.configCache.set(institutionId, {
      data: { ...config },
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateConfiguration(institutionId: string): void {
    this.configCache.delete(institutionId);
  }

  // --- Branding Cache ---
  public getBranding(institutionId: string): InstitutionBrandingEntity | null {
    const entry = this.brandingCache.get(institutionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.brandingCache.delete(institutionId);
      return null;
    }
    return { ...entry.data };
  }

  public setBranding(institutionId: string, branding: InstitutionBrandingEntity): void {
    this.brandingCache.set(institutionId, {
      data: { ...branding },
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateBranding(institutionId: string): void {
    this.brandingCache.delete(institutionId);
  }

  // --- Calendar Cache ---
  public getCalendar(institutionId: string): AcademicCalendarEntity[] | null {
    const entry = this.calendarCache.get(institutionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.calendarCache.delete(institutionId);
      return null;
    }
    return [...entry.data];
  }

  public setCalendar(institutionId: string, events: AcademicCalendarEntity[]): void {
    this.calendarCache.set(institutionId, {
      data: [...events],
      expiresAt: Date.now() + this.defaultTtlMs
    });
  }

  public invalidateCalendar(institutionId: string): void {
    this.calendarCache.delete(institutionId);
  }

  public invalidateAll(institutionId: string): void {
    this.invalidateInstitution(institutionId);
    this.invalidateDepartments(institutionId);
    this.invalidateCourses(institutionId);
    this.invalidateConfiguration(institutionId);
    this.invalidateBranding(institutionId);
    this.invalidateCalendar(institutionId);
  }

  public clear(): void {
    this.institutionCache.clear();
    this.departmentCache.clear();
    this.courseCache.clear();
    this.configCache.clear();
    this.brandingCache.clear();
    this.calendarCache.clear();
  }
}
