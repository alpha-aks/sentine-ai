import {
  ExamConfigurationEntity,
  ExamEligibilityEntity,
  ExamEntity,
  ExamPolicyEntity,
  ExamPublicationEntity,
  ExamRuleEntity,
  ExamScheduleEntity,
  ExamSearchQueryDto,
  ExamSectionEntity,
  ExamTemplateEntity
} from '../types/exam';

export class ExamRepository {
  private exams: Map<string, ExamEntity> = new Map(); // examId -> Entity
  private examsByCode: Map<string, string> = new Map(); // `${instId}:${code}` -> examId
  private sections: Map<string, ExamSectionEntity[]> = new Map(); // examId -> Entities[]
  private rules: Map<string, ExamRuleEntity> = new Map(); // examId -> Entity
  private policies: Map<string, ExamPolicyEntity> = new Map(); // examId -> Entity
  private schedules: Map<string, ExamScheduleEntity> = new Map(); // examId -> Entity
  private eligibilities: Map<string, ExamEligibilityEntity> = new Map(); // examId -> Entity
  private configurations: Map<string, ExamConfigurationEntity> = new Map(); // examId -> Entity
  private templates: Map<string, ExamTemplateEntity> = new Map(); // templateId -> Entity
  private publications: Map<string, ExamPublicationEntity> = new Map(); // examId -> Entity

  // --- Exam CRUD & Search ---
  public async createExam(entity: ExamEntity): Promise<ExamEntity> {
    const codeKey = `${entity.institutionId}:${entity.code.toLowerCase().trim()}`;
    if (this.examsByCode.has(codeKey)) {
      throw new Error(`Exam code "${entity.code}" already exists in institution ${entity.institutionId}`);
    }
    this.exams.set(entity.examId, { ...entity });
    this.examsByCode.set(codeKey, entity.examId);
    return { ...entity };
  }

  public async findExamById(examId: string): Promise<ExamEntity | null> {
    const exam = this.exams.get(examId);
    return exam ? { ...exam } : null;
  }

  public async updateExam(examId: string, updates: Partial<ExamEntity>): Promise<ExamEntity> {
    const existing = this.exams.get(examId);
    if (!existing) {
      throw new Error(`Exam ${examId} not found`);
    }

    const updated: ExamEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.code && updates.code.toLowerCase() !== existing.code.toLowerCase()) {
      const oldKey = `${existing.institutionId}:${existing.code.toLowerCase()}`;
      const newKey = `${existing.institutionId}:${updates.code.toLowerCase()}`;
      this.examsByCode.delete(oldKey);
      this.examsByCode.set(newKey, examId);
    }

    this.exams.set(examId, updated);
    return { ...updated };
  }

  public async deleteExam(examId: string): Promise<void> {
    const exam = this.exams.get(examId);
    if (exam) {
      const codeKey = `${exam.institutionId}:${exam.code.toLowerCase()}`;
      this.examsByCode.delete(codeKey);
      this.exams.delete(examId);
      this.sections.delete(examId);
      this.rules.delete(examId);
      this.policies.delete(examId);
      this.schedules.delete(examId);
      this.eligibilities.delete(examId);
      this.configurations.delete(examId);
      this.publications.delete(examId);
    }
  }

  public async searchExams(queryDto: ExamSearchQueryDto): Promise<{ items: ExamEntity[]; total: number }> {
    let results = Array.from(this.exams.values());

    if (queryDto.institutionId) {
      results = results.filter(e => e.institutionId === queryDto.institutionId);
    }
    if (queryDto.type) {
      results = results.filter(e => e.type === queryDto.type);
    }
    if (queryDto.status) {
      results = results.filter(e => e.status === queryDto.status);
    }
    if (queryDto.query) {
      const q = queryDto.query.toLowerCase().trim();
      results = results.filter(e => e.title.toLowerCase().includes(q) || e.code.toLowerCase().includes(q));
    }

    const total = results.length;
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.max(1, Math.min(100, queryDto.limit || 20));
    const startIndex = (page - 1) * limit;

    const items = results.slice(startIndex, startIndex + limit).map(e => ({ ...e }));
    return { items, total };
  }

  // --- Sub-resource Persistence Methods ---
  public async setSections(examId: string, sectionList: ExamSectionEntity[]): Promise<ExamSectionEntity[]> {
    this.sections.set(examId, sectionList.map(s => ({ ...s })));
    return this.getSections(examId);
  }

  public async getSections(examId: string): Promise<ExamSectionEntity[]> {
    return (this.sections.get(examId) || []).map(s => ({ ...s }));
  }

  public async saveRule(entity: ExamRuleEntity): Promise<ExamRuleEntity> {
    this.rules.set(entity.examId, { ...entity });
    return { ...entity };
  }

  public async getRule(examId: string): Promise<ExamRuleEntity | null> {
    const r = this.rules.get(examId);
    return r ? { ...r } : null;
  }

  public async savePolicy(entity: ExamPolicyEntity): Promise<ExamPolicyEntity> {
    this.policies.set(entity.examId, { ...entity });
    return { ...entity };
  }

  public async getPolicy(examId: string): Promise<ExamPolicyEntity | null> {
    const p = this.policies.get(examId);
    return p ? { ...p } : null;
  }

  public async saveSchedule(entity: ExamScheduleEntity): Promise<ExamScheduleEntity> {
    this.schedules.set(entity.examId, { ...entity });
    return { ...entity };
  }

  public async getSchedule(examId: string): Promise<ExamScheduleEntity | null> {
    const s = this.schedules.get(examId);
    return s ? { ...s } : null;
  }

  public async saveEligibility(entity: ExamEligibilityEntity): Promise<ExamEligibilityEntity> {
    this.eligibilities.set(entity.examId, { ...entity });
    return { ...entity };
  }

  public async getEligibility(examId: string): Promise<ExamEligibilityEntity | null> {
    const e = this.eligibilities.get(examId);
    return e ? { ...e } : null;
  }

  public async saveConfiguration(entity: ExamConfigurationEntity): Promise<ExamConfigurationEntity> {
    this.configurations.set(entity.examId, { ...entity });
    return { ...entity };
  }

  public async getConfiguration(examId: string): Promise<ExamConfigurationEntity | null> {
    const c = this.configurations.get(examId);
    return c ? { ...c } : null;
  }

  public async savePublication(entity: ExamPublicationEntity): Promise<ExamPublicationEntity> {
    this.publications.set(entity.examId, { ...entity });
    return { ...entity };
  }

  public async getPublication(examId: string): Promise<ExamPublicationEntity | null> {
    const pub = this.publications.get(examId);
    return pub ? { ...pub } : null;
  }

  // --- Exam Templates ---
  public async createTemplate(entity: ExamTemplateEntity): Promise<ExamTemplateEntity> {
    this.templates.set(entity.templateId, { ...entity });
    return { ...entity };
  }

  public async findTemplateById(templateId: string): Promise<ExamTemplateEntity | null> {
    const t = this.templates.get(templateId);
    return t ? { ...t } : null;
  }

  public clear(): void {
    this.exams.clear();
    this.examsByCode.clear();
    this.sections.clear();
    this.rules.clear();
    this.policies.clear();
    this.schedules.clear();
    this.eligibilities.clear();
    this.configurations.clear();
    this.templates.clear();
    this.publications.clear();
  }
}
