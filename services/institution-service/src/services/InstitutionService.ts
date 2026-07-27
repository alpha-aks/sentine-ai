import { generateUuid } from '@sentinel-ai/utils';
import { isValidEmail } from '@sentinel-ai/validation';
import { InstitutionCache } from '../cache/InstitutionCache';
import { getInstitutionServiceConfig, InstitutionServiceConfig } from '../config/institution-config';
import { InstitutionRepository } from '../db/InstitutionRepository';
import { InstitutionEventPublisher } from '../events/InstitutionEventPublisher';
import {
  AcademicCalendarEntity,
  AcademicProgramEntity,
  AssignFacultyDto,
  BatchEntity,
  CourseEntity,
  CreateBatchDto,
  CreateCalendarEventDto,
  CreateCourseDto,
  CreateDepartmentDto,
  CreateInstitutionDto,
  CreateProgramDto,
  CreateSemesterDto,
  DepartmentEntity,
  FacultyEntity,
  InstitutionBrandingEntity,
  InstitutionConfigurationEntity,
  InstitutionDetailResponseDto,
  InstitutionEntity,
  InstitutionSearchQueryDto,
  SemesterEntity,
  UpdateBrandingDto,
  UpdateConfigurationDto,
  UpdateInstitutionDto
} from '../types/institution';

export class InstitutionService {
  private readonly repository: InstitutionRepository;
  private readonly cache: InstitutionCache;
  private readonly eventPublisher: InstitutionEventPublisher;
  private readonly config: InstitutionServiceConfig;

  constructor(
    repository?: InstitutionRepository,
    cache?: InstitutionCache,
    eventPublisher?: InstitutionEventPublisher,
    config?: InstitutionServiceConfig
  ) {
    this.repository = repository || new InstitutionRepository();
    this.config = config || getInstitutionServiceConfig();
    this.cache = cache || new InstitutionCache(this.config.cacheTtlSeconds);
    this.eventPublisher = eventPublisher || new InstitutionEventPublisher();
  }

  public getRepository(): InstitutionRepository {
    return this.repository;
  }

  public getCache(): InstitutionCache {
    return this.cache;
  }

  // --- 1. INSTITUTION MANAGEMENT ---
  public async createInstitution(dto: CreateInstitutionDto): Promise<InstitutionDetailResponseDto> {
    if (!dto.slug || !dto.name) {
      throw new Error('INSTITUTION_INVALID_INPUT: Slug and name are required');
    }
    if (!isValidEmail(dto.contactEmail)) {
      throw new Error('INSTITUTION_INVALID_INPUT: Valid contact email is required');
    }

    const institutionId = generateUuid();
    const now = new Date().toISOString();

    const entity: InstitutionEntity = {
      institutionId,
      slug: dto.slug.toLowerCase().trim(),
      name: dto.name.trim(),
      type: dto.type,
      status: 'ACTIVE',
      contactEmail: dto.contactEmail.toLowerCase().trim(),
      phoneNumber: dto.phoneNumber || null,
      address: dto.address || null,
      createdAt: now,
      updatedAt: now
    };

    await this.repository.createInstitution(entity);

    // Provisions default branding
    const branding: InstitutionBrandingEntity = {
      brandingId: generateUuid(),
      institutionId,
      logoUrl: this.config.defaultLogoUrl,
      primaryColor: this.config.defaultPrimaryColor,
      secondaryColor: this.config.defaultSecondaryColor,
      portalDomain: `${dto.slug}.sentinelai.io`,
      customCssUrl: null,
      updatedAt: now
    };
    await this.repository.saveBranding(branding);

    // Provisions default configuration
    const configuration: InstitutionConfigurationEntity = {
      configId: generateUuid(),
      institutionId,
      sensitivityProfile: 'STANDARD',
      allowMobileExams: true,
      autoTerminateOnCriticalAlert: false,
      allowedIpRanges: ['0.0.0.0/0'],
      ssoEnabled: false,
      ssoProviderUrl: null,
      updatedAt: now
    };
    await this.repository.saveConfiguration(configuration);

    await this.eventPublisher.publishInstitutionCreated(entity);

    return this.getInstitutionDetails(institutionId);
  }

  public async getInstitutionDetails(institutionId: string): Promise<InstitutionDetailResponseDto> {
    const cachedInst = this.cache.getInstitution(institutionId);
    let institution = cachedInst;

    if (!institution) {
      institution = await this.repository.findInstitutionById(institutionId);
      if (!institution) {
        throw new Error(`INSTITUTION_NOT_FOUND: Institution with ID ${institutionId} not found`);
      }
      this.cache.setInstitution(institutionId, institution);
    }

    const branding = (await this.repository.getBranding(institutionId)) || undefined;
    const configuration = (await this.repository.getConfiguration(institutionId)) || undefined;
    const departments = await this.repository.getDepartmentsByInstitution(institutionId);
    const programs = await this.repository.getProgramsByInstitution(institutionId);
    const activeEvents = await this.repository.getCalendarEventsByInstitution(institutionId);

    return {
      institution,
      branding,
      configuration,
      departments,
      programs,
      activeEvents
    };
  }

  public async updateInstitution(
    institutionId: string,
    dto: UpdateInstitutionDto
  ): Promise<InstitutionEntity> {
    const updated = await this.repository.updateInstitution(institutionId, dto);
    this.cache.invalidateInstitution(institutionId);
    await this.eventPublisher.publishInstitutionUpdated(updated);
    return updated;
  }

  public async deleteInstitution(institutionId: string): Promise<void> {
    await this.repository.deleteInstitution(institutionId);
    this.cache.invalidateAll(institutionId);
    await this.eventPublisher.publishInstitutionDeleted(institutionId);
  }

  public async searchInstitutions(
    queryDto: InstitutionSearchQueryDto
  ): Promise<{ items: InstitutionEntity[]; total: number }> {
    return this.repository.searchInstitutions(queryDto);
  }

  // --- 2. DEPARTMENT MANAGEMENT ---
  public async createDepartment(
    institutionId: string,
    dto: CreateDepartmentDto
  ): Promise<DepartmentEntity> {
    if (!dto.code || !dto.name) {
      throw new Error('INSTITUTION_INVALID_INPUT: Department code and name are required');
    }

    const entity: DepartmentEntity = {
      departmentId: generateUuid(),
      institutionId,
      code: dto.code.toUpperCase().trim(),
      name: dto.name.trim(),
      headOfDepartment: dto.headOfDepartment || null,
      createdAt: new Date().toISOString()
    };

    await this.repository.createDepartment(entity);
    this.cache.invalidateDepartments(institutionId);
    await this.eventPublisher.publishDepartmentCreated(entity);
    return entity;
  }

  public async getDepartments(institutionId: string): Promise<DepartmentEntity[]> {
    const cached = this.cache.getDepartments(institutionId);
    if (cached) return cached;

    const depts = await this.repository.getDepartmentsByInstitution(institutionId);
    this.cache.setDepartments(institutionId, depts);
    return depts;
  }

  // --- 3. COURSE MANAGEMENT ---
  public async createCourse(institutionId: string, dto: CreateCourseDto): Promise<CourseEntity> {
    if (!dto.code || !dto.title || dto.credits <= 0) {
      throw new Error('INSTITUTION_INVALID_INPUT: Valid course code, title, and positive credits are required');
    }

    const entity: CourseEntity = {
      courseId: generateUuid(),
      institutionId,
      departmentId: dto.departmentId,
      code: dto.code.toUpperCase().trim(),
      title: dto.title.trim(),
      description: dto.description || null,
      credits: dto.credits,
      createdAt: new Date().toISOString()
    };

    await this.repository.createCourse(entity);
    this.cache.invalidateCourses(institutionId);
    await this.eventPublisher.publishCourseCreated(entity);
    return entity;
  }

  public async getCourses(institutionId: string, departmentId?: string): Promise<CourseEntity[]> {
    const cached = this.cache.getCourses(institutionId);
    if (cached && !departmentId) return cached;

    const courses = await this.repository.getCoursesByInstitution(institutionId, departmentId);
    if (!departmentId) this.cache.setCourses(institutionId, courses);
    return courses;
  }

  // --- 4. FACULTY MANAGEMENT ---
  public async assignFaculty(institutionId: string, dto: AssignFacultyDto): Promise<FacultyEntity> {
    if (!isValidEmail(dto.email)) {
      throw new Error('INSTITUTION_INVALID_INPUT: Valid faculty email is required');
    }

    const entity: FacultyEntity = {
      facultyId: generateUuid(),
      institutionId,
      departmentId: dto.departmentId,
      userId: dto.userId,
      title: dto.title,
      email: dto.email.toLowerCase(),
      assignedCourses: dto.assignedCourses || [],
      joinedAt: new Date().toISOString()
    };

    await this.repository.addFaculty(entity);
    await this.eventPublisher.publishFacultyAssigned(entity);
    return entity;
  }

  public async getFaculty(institutionId: string, departmentId?: string): Promise<FacultyEntity[]> {
    return this.repository.getFacultyByInstitution(institutionId, departmentId);
  }

  // --- 5. ACADEMIC PROGRAM MANAGEMENT ---
  public async createProgram(
    institutionId: string,
    dto: CreateProgramDto
  ): Promise<AcademicProgramEntity> {
    const entity: AcademicProgramEntity = {
      programId: generateUuid(),
      institutionId,
      code: dto.code.toUpperCase().trim(),
      title: dto.title.trim(),
      degreeLevel: dto.degreeLevel,
      totalCreditsRequired: dto.totalCreditsRequired,
      durationYears: dto.durationYears
    };

    return this.repository.createProgram(entity);
  }

  public async getPrograms(institutionId: string): Promise<AcademicProgramEntity[]> {
    return this.repository.getProgramsByInstitution(institutionId);
  }

  // --- 6. BATCH & SEMESTER MANAGEMENT ---
  public async createBatch(institutionId: string, dto: CreateBatchDto): Promise<BatchEntity> {
    const entity: BatchEntity = {
      batchId: generateUuid(),
      institutionId,
      programId: dto.programId,
      year: dto.year,
      name: dto.name,
      maxCapacity: dto.maxCapacity
    };
    return this.repository.createBatch(entity);
  }

  public async createSemester(institutionId: string, dto: CreateSemesterDto): Promise<SemesterEntity> {
    const entity: SemesterEntity = {
      semesterId: generateUuid(),
      institutionId,
      batchId: dto.batchId,
      termName: dto.termName,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isCurrent: dto.isCurrent ?? false
    };
    return this.repository.createSemester(entity);
  }

  public async getSemesters(batchId: string): Promise<SemesterEntity[]> {
    return this.repository.getSemestersByBatch(batchId);
  }

  // --- 7. ACADEMIC CALENDAR ---
  public async addCalendarEvent(
    institutionId: string,
    dto: CreateCalendarEventDto
  ): Promise<AcademicCalendarEntity[]> {
    const entity: AcademicCalendarEntity = {
      calendarId: generateUuid(),
      institutionId,
      title: dto.title,
      eventDate: dto.eventDate,
      eventType: dto.eventType,
      description: dto.description || null
    };

    await this.repository.createCalendarEvent(entity);
    this.cache.invalidateCalendar(institutionId);

    const allEvents = await this.repository.getCalendarEventsByInstitution(institutionId);
    await this.eventPublisher.publishAcademicCalendarUpdated(institutionId, allEvents);
    return allEvents;
  }

  public async getCalendar(institutionId: string): Promise<AcademicCalendarEntity[]> {
    const cached = this.cache.getCalendar(institutionId);
    if (cached) return cached;

    const events = await this.repository.getCalendarEventsByInstitution(institutionId);
    this.cache.setCalendar(institutionId, events);
    return events;
  }

  // --- 8. BRANDING MANAGEMENT ---
  public async updateBranding(
    institutionId: string,
    dto: UpdateBrandingDto
  ): Promise<InstitutionBrandingEntity> {
    let branding = await this.repository.getBranding(institutionId);
    const now = new Date().toISOString();

    if (!branding) {
      branding = {
        brandingId: generateUuid(),
        institutionId,
        logoUrl: dto.logoUrl || this.config.defaultLogoUrl,
        primaryColor: dto.primaryColor || this.config.defaultPrimaryColor,
        secondaryColor: dto.secondaryColor || this.config.defaultSecondaryColor,
        portalDomain: dto.portalDomain || null,
        customCssUrl: dto.customCssUrl || null,
        updatedAt: now
      };
    } else {
      branding = {
        ...branding,
        ...dto,
        updatedAt: now
      };
    }

    await this.repository.saveBranding(branding);
    this.cache.setBranding(institutionId, branding);
    return branding;
  }

  public async getBranding(institutionId: string): Promise<InstitutionBrandingEntity> {
    const cached = this.cache.getBranding(institutionId);
    if (cached) return cached;

    let branding = await this.repository.getBranding(institutionId);
    if (!branding) {
      branding = await this.updateBranding(institutionId, {});
    } else {
      this.cache.setBranding(institutionId, branding);
    }
    return branding;
  }

  // --- 9. CONFIGURATION MANAGEMENT ---
  public async updateConfiguration(
    institutionId: string,
    dto: UpdateConfigurationDto
  ): Promise<InstitutionConfigurationEntity> {
    let config = await this.repository.getConfiguration(institutionId);
    const now = new Date().toISOString();

    if (!config) {
      config = {
        configId: generateUuid(),
        institutionId,
        sensitivityProfile: dto.sensitivityProfile || 'STANDARD',
        allowMobileExams: dto.allowMobileExams ?? true,
        autoTerminateOnCriticalAlert: dto.autoTerminateOnCriticalAlert ?? false,
        allowedIpRanges: dto.allowedIpRanges || ['0.0.0.0/0'],
        ssoEnabled: dto.ssoEnabled ?? false,
        ssoProviderUrl: dto.ssoProviderUrl || null,
        updatedAt: now
      };
    } else {
      config = {
        ...config,
        ...dto,
        updatedAt: now
      };
    }

    await this.repository.saveConfiguration(config);
    this.cache.setConfiguration(institutionId, config);

    await this.eventPublisher.publishInstitutionConfigurationChanged(institutionId, config);
    return config;
  }

  public async getConfiguration(institutionId: string): Promise<InstitutionConfigurationEntity> {
    const cached = this.cache.getConfiguration(institutionId);
    if (cached) return cached;

    let config = await this.repository.getConfiguration(institutionId);
    if (!config) {
      config = await this.updateConfiguration(institutionId, {});
    } else {
      this.cache.setConfiguration(institutionId, config);
    }
    return config;
  }
}
