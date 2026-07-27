import {
  AcademicCalendarEntity,
  AcademicProgramEntity,
  BatchEntity,
  CourseEntity,
  DepartmentEntity,
  FacultyEntity,
  InstitutionBrandingEntity,
  InstitutionConfigurationEntity,
  InstitutionEntity,
  InstitutionSearchQueryDto,
  SemesterEntity
} from '../types/institution';

export class InstitutionRepository {
  private institutions: Map<string, InstitutionEntity> = new Map(); // id -> Entity
  private institutionsBySlug: Map<string, string> = new Map(); // slug -> id
  private departments: Map<string, DepartmentEntity> = new Map(); // deptId -> Entity
  private courses: Map<string, CourseEntity> = new Map(); // courseId -> Entity
  private faculty: Map<string, FacultyEntity> = new Map(); // facultyId -> Entity
  private programs: Map<string, AcademicProgramEntity> = new Map(); // programId -> Entity
  private batches: Map<string, BatchEntity> = new Map(); // batchId -> Entity
  private semesters: Map<string, SemesterEntity> = new Map(); // semesterId -> Entity
  private calendarEvents: Map<string, AcademicCalendarEntity> = new Map(); // calendarId -> Entity
  private brandings: Map<string, InstitutionBrandingEntity> = new Map(); // institutionId -> Entity
  private configurations: Map<string, InstitutionConfigurationEntity> = new Map(); // institutionId -> Entity

  // --- Institution CRUD ---
  public async createInstitution(entity: InstitutionEntity): Promise<InstitutionEntity> {
    const slugKey = entity.slug.toLowerCase().trim();
    if (this.institutionsBySlug.has(slugKey)) {
      throw new Error(`Institution slug "${entity.slug}" is already registered`);
    }
    this.institutions.set(entity.institutionId, { ...entity });
    this.institutionsBySlug.set(slugKey, entity.institutionId);
    return { ...entity };
  }

  public async findInstitutionById(institutionId: string): Promise<InstitutionEntity | null> {
    const inst = this.institutions.get(institutionId);
    return inst ? { ...inst } : null;
  }

  public async findInstitutionBySlug(slug: string): Promise<InstitutionEntity | null> {
    const id = this.institutionsBySlug.get(slug.toLowerCase().trim());
    if (!id) return null;
    return this.findInstitutionById(id);
  }

  public async updateInstitution(institutionId: string, updates: Partial<InstitutionEntity>): Promise<InstitutionEntity> {
    const existing = this.institutions.get(institutionId);
    if (!existing) {
      throw new Error(`Institution ${institutionId} not found`);
    }

    const updated: InstitutionEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.slug && updates.slug.toLowerCase() !== existing.slug.toLowerCase()) {
      this.institutionsBySlug.delete(existing.slug.toLowerCase());
      this.institutionsBySlug.set(updates.slug.toLowerCase(), institutionId);
    }

    this.institutions.set(institutionId, updated);
    return { ...updated };
  }

  public async deleteInstitution(institutionId: string): Promise<void> {
    const inst = this.institutions.get(institutionId);
    if (inst) {
      this.institutionsBySlug.delete(inst.slug.toLowerCase());
      this.institutions.delete(institutionId);
      this.brandings.delete(institutionId);
      this.configurations.delete(institutionId);

      // Prune sub-resources
      for (const [id, d] of this.departments.entries()) {
        if (d.institutionId === institutionId) this.departments.delete(id);
      }
      for (const [id, c] of this.courses.entries()) {
        if (c.institutionId === institutionId) this.courses.delete(id);
      }
      for (const [id, f] of this.faculty.entries()) {
        if (f.institutionId === institutionId) this.faculty.delete(id);
      }
      for (const [id, p] of this.programs.entries()) {
        if (p.institutionId === institutionId) this.programs.delete(id);
      }
      for (const [id, b] of this.batches.entries()) {
        if (b.institutionId === institutionId) this.batches.delete(id);
      }
      for (const [id, s] of this.semesters.entries()) {
        if (s.institutionId === institutionId) this.semesters.delete(id);
      }
      for (const [id, cal] of this.calendarEvents.entries()) {
        if (cal.institutionId === institutionId) this.calendarEvents.delete(id);
      }
    }
  }

  public async searchInstitutions(queryDto: InstitutionSearchQueryDto): Promise<{ items: InstitutionEntity[]; total: number }> {
    let results = Array.from(this.institutions.values());

    if (queryDto.type) {
      results = results.filter(i => i.type === queryDto.type);
    }
    if (queryDto.status) {
      results = results.filter(i => i.status === queryDto.status);
    }
    if (queryDto.query) {
      const q = queryDto.query.toLowerCase().trim();
      results = results.filter(i => i.name.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q));
    }

    const total = results.length;
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.max(1, Math.min(100, queryDto.limit || 20));
    const startIndex = (page - 1) * limit;

    const items = results.slice(startIndex, startIndex + limit).map(i => ({ ...i }));
    return { items, total };
  }

  // --- Department CRUD ---
  public async createDepartment(entity: DepartmentEntity): Promise<DepartmentEntity> {
    // Uniqueness check for code within institution
    for (const d of this.departments.values()) {
      if (d.institutionId === entity.institutionId && d.code.toLowerCase() === entity.code.toLowerCase()) {
        throw new Error(`Department code "${entity.code}" already exists in institution ${entity.institutionId}`);
      }
    }
    this.departments.set(entity.departmentId, { ...entity });
    return { ...entity };
  }

  public async getDepartmentsByInstitution(institutionId: string): Promise<DepartmentEntity[]> {
    return Array.from(this.departments.values())
      .filter(d => d.institutionId === institutionId)
      .map(d => ({ ...d }));
  }

  // --- Course CRUD ---
  public async createCourse(entity: CourseEntity): Promise<CourseEntity> {
    for (const c of this.courses.values()) {
      if (c.institutionId === entity.institutionId && c.code.toLowerCase() === entity.code.toLowerCase()) {
        throw new Error(`Course code "${entity.code}" already exists in institution ${entity.institutionId}`);
      }
    }
    this.courses.set(entity.courseId, { ...entity });
    return { ...entity };
  }

  public async getCoursesByInstitution(institutionId: string, departmentId?: string): Promise<CourseEntity[]> {
    return Array.from(this.courses.values())
      .filter(c => c.institutionId === institutionId && (!departmentId || c.departmentId === departmentId))
      .map(c => ({ ...c }));
  }

  // --- Faculty Management ---
  public async addFaculty(entity: FacultyEntity): Promise<FacultyEntity> {
    this.faculty.set(entity.facultyId, { ...entity });
    return { ...entity };
  }

  public async getFacultyByInstitution(institutionId: string, departmentId?: string): Promise<FacultyEntity[]> {
    return Array.from(this.faculty.values())
      .filter(f => f.institutionId === institutionId && (!departmentId || f.departmentId === departmentId))
      .map(f => ({ ...f }));
  }

  // --- Academic Program CRUD ---
  public async createProgram(entity: AcademicProgramEntity): Promise<AcademicProgramEntity> {
    this.programs.set(entity.programId, { ...entity });
    return { ...entity };
  }

  public async getProgramsByInstitution(institutionId: string): Promise<AcademicProgramEntity[]> {
    return Array.from(this.programs.values())
      .filter(p => p.institutionId === institutionId)
      .map(p => ({ ...p }));
  }

  // --- Batch / Semester Management ---
  public async createBatch(entity: BatchEntity): Promise<BatchEntity> {
    this.batches.set(entity.batchId, { ...entity });
    return { ...entity };
  }

  public async createSemester(entity: SemesterEntity): Promise<SemesterEntity> {
    if (entity.isCurrent) {
      for (const s of this.semesters.values()) {
        if (s.batchId === entity.batchId) s.isCurrent = false;
      }
    }
    this.semesters.set(entity.semesterId, { ...entity });
    return { ...entity };
  }

  public async getSemestersByBatch(batchId: string): Promise<SemesterEntity[]> {
    return Array.from(this.semesters.values())
      .filter(s => s.batchId === batchId)
      .map(s => ({ ...s }));
  }

  // --- Academic Calendar ---
  public async createCalendarEvent(entity: AcademicCalendarEntity): Promise<AcademicCalendarEntity> {
    this.calendarEvents.set(entity.calendarId, { ...entity });
    return { ...entity };
  }

  public async getCalendarEventsByInstitution(institutionId: string): Promise<AcademicCalendarEntity[]> {
    return Array.from(this.calendarEvents.values())
      .filter(c => c.institutionId === institutionId)
      .map(c => ({ ...c }));
  }

  // --- Branding ---
  public async getBranding(institutionId: string): Promise<InstitutionBrandingEntity | null> {
    const b = this.brandings.get(institutionId);
    return b ? { ...b } : null;
  }

  public async saveBranding(entity: InstitutionBrandingEntity): Promise<InstitutionBrandingEntity> {
    this.brandings.set(entity.institutionId, { ...entity });
    return { ...entity };
  }

  // --- Configuration ---
  public async getConfiguration(institutionId: string): Promise<InstitutionConfigurationEntity | null> {
    const c = this.configurations.get(institutionId);
    return c ? { ...c } : null;
  }

  public async saveConfiguration(entity: InstitutionConfigurationEntity): Promise<InstitutionConfigurationEntity> {
    this.configurations.set(entity.institutionId, { ...entity });
    return { ...entity };
  }

  public clear(): void {
    this.institutions.clear();
    this.institutionsBySlug.clear();
    this.departments.clear();
    this.courses.clear();
    this.faculty.clear();
    this.programs.clear();
    this.batches.clear();
    this.semesters.clear();
    this.calendarEvents.clear();
    this.brandings.clear();
    this.configurations.clear();
  }
}
