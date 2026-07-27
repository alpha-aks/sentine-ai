import { generateUuid } from '@sentinel-ai/utils';
import { ExamCache } from '../cache/ExamCache';
import { ExamServiceConfig, getExamServiceConfig } from '../config/exam-config';
import { ExamRepository } from '../db/ExamRepository';
import { ExamEventPublisher } from '../events/ExamEventPublisher';
import {
  CreateExamDto,
  EligibilityCriteriaDto,
  ExamConfigurationEntity,
  ExamEligibilityEntity,
  ExamEntity,
  ExamPolicyEntity,
  ExamPublicationEntity,
  ExamResponseDto,
  ExamRuleEntity,
  ExamScheduleEntity,
  ExamSearchQueryDto,
  ExamSectionDto,
  ExamSectionEntity,
  ExamTemplateEntity,
  ScheduleExamDto,
  UpdateExamDto
} from '../types/exam';

export class ExamService {
  private readonly repository: ExamRepository;
  private readonly cache: ExamCache;
  private readonly eventPublisher: ExamEventPublisher;
  private readonly config: ExamServiceConfig;

  constructor(
    repository?: ExamRepository,
    cache?: ExamCache,
    eventPublisher?: ExamEventPublisher,
    config?: ExamServiceConfig
  ) {
    this.repository = repository || new ExamRepository();
    this.config = config || getExamServiceConfig();
    this.cache = cache || new ExamCache(this.config.cacheTtlSeconds);
    this.eventPublisher = eventPublisher || new ExamEventPublisher();
  }

  public getRepository(): ExamRepository {
    return this.repository;
  }

  public getCache(): ExamCache {
    return this.cache;
  }

  // --- 1. EXAM LIFECYCLE CRUD ---
  public async createExam(dto: CreateExamDto, actorUserId: string): Promise<ExamResponseDto> {
    if (!dto.code || !dto.title || dto.totalDurationMinutes <= 0) {
      throw new Error('EXAM_INVALID_INPUT: Code, title, and positive total duration are required');
    }
    if (dto.totalDurationMinutes > this.config.maxExamDurationMinutes) {
      throw new Error(`EXAM_INVALID_INPUT: Exam duration cannot exceed ${this.config.maxExamDurationMinutes} minutes`);
    }

    const examId = generateUuid();
    const now = new Date().toISOString();

    const exam: ExamEntity = {
      examId,
      institutionId: dto.institutionId,
      code: dto.code.toUpperCase().trim(),
      title: dto.title.trim(),
      description: dto.description || null,
      type: dto.type || 'MIDTERM',
      status: 'DRAFT',
      difficultyLevel: dto.difficultyLevel || 'MEDIUM',
      totalDurationMinutes: dto.totalDurationMinutes,
      totalPoints: dto.totalPoints || 100,
      passingPercentage: dto.passingPercentage || 60,
      maxAttemptsAllowed: dto.maxAttemptsAllowed || 1,
      createdById: actorUserId,
      createdAt: now,
      updatedAt: now
    };

    await this.repository.createExam(exam);

    // Initial Security Rules
    const rules: ExamRuleEntity = {
      ruleId: generateUuid(),
      examId,
      browserLockEnabled: dto.rules?.browserLockEnabled ?? true,
      fullscreenRequired: dto.rules?.fullscreenRequired ?? true,
      tabSwitchDetection: dto.rules?.tabSwitchDetection ?? true,
      copyPasteRestricted: dto.rules?.copyPasteRestricted ?? true,
      multiMonitorBlocked: dto.rules?.multiMonitorBlocked ?? true,
      virtualMachineBlocked: dto.rules?.virtualMachineBlocked ?? true,
      devToolsBlocked: dto.rules?.devToolsBlocked ?? true,
      calculatorAllowed: dto.rules?.calculatorAllowed ?? false,
      externalResourcesAllowed: dto.rules?.externalResourcesAllowed ?? false,
      microphoneRequired: dto.rules?.microphoneRequired ?? true,
      cameraRequired: dto.rules?.cameraRequired ?? true,
      screenSharingRequired: dto.rules?.screenSharingRequired ?? false,
      idleTimeoutMinutes: dto.rules?.idleTimeoutMinutes || 10,
      lateEntryGraceMinutes: dto.rules?.lateEntryGraceMinutes || this.config.defaultGracePeriodMinutes,
      autoSubmitOnTimeUp: dto.rules?.autoSubmitOnTimeUp ?? true,
      networkReconnectionTimeoutSeconds: dto.rules?.networkReconnectionTimeoutSeconds || 120
    };
    await this.repository.saveRule(rules);

    // Initial AI Proctoring Policy
    const policy: ExamPolicyEntity = {
      policyId: generateUuid(),
      examId,
      visionMonitoring: dto.policy?.visionMonitoring ?? true,
      behaviorMonitoring: dto.policy?.behaviorMonitoring ?? true,
      collusionDetection: dto.policy?.collusionDetection ?? true,
      sensitivityProfile: dto.policy?.sensitivityProfile || 'STANDARD',
      riskThresholdPercentage: dto.policy?.riskThresholdPercentage || 75,
      videoRecordingPolicy: dto.policy?.videoRecordingPolicy || 'FULL_RECORDING',
      audioRecordingPolicy: dto.policy?.audioRecordingPolicy || 'FULL_RECORDING',
      evidenceRetentionDays: dto.policy?.evidenceRetentionDays || 90,
      humanReviewRequired: dto.policy?.humanReviewRequired ?? false
    };
    await this.repository.savePolicy(policy);

    // Initial Eligibility Criteria
    const eligibility: ExamEligibilityEntity = {
      eligibilityId: generateUuid(),
      examId,
      allowedDepartmentIds: dto.eligibility?.allowedDepartmentIds || [],
      allowedCourseIds: dto.eligibility?.allowedCourseIds || [],
      allowedProgramIds: dto.eligibility?.allowedProgramIds || [],
      allowedBatchIds: dto.eligibility?.allowedBatchIds || [],
      candidateWhitelist: dto.eligibility?.candidateWhitelist || [],
      candidateBlacklist: dto.eligibility?.candidateBlacklist || []
    };
    await this.repository.saveEligibility(eligibility);

    // Initial Configuration
    const configuration: ExamConfigurationEntity = {
      configurationId: generateUuid(),
      examId,
      instructions: 'Please follow all proctoring guidelines carefully.',
      language: 'en-US',
      shuffleQuestions: true,
      shuffleOptions: true,
      showResultsImmediately: false
    };
    await this.repository.saveConfiguration(configuration);

    // Initial Sections
    if (dto.sections && dto.sections.length > 0) {
      const sectionEntities: ExamSectionEntity[] = dto.sections.map((s, idx) => ({
        sectionId: generateUuid(),
        examId,
        title: s.title,
        instructions: s.instructions || null,
        durationMinutes: s.durationMinutes || null,
        questionPoolId: s.questionPoolId || null,
        weightPercentage: s.weightPercentage || Math.floor(100 / dto.sections!.length),
        isMandatory: s.isMandatory ?? true,
        isRandomized: s.isRandomized ?? true,
        sequenceOrder: s.sequenceOrder || idx + 1
      }));
      await this.repository.setSections(examId, sectionEntities);
    }

    await this.eventPublisher.publishExamCreated(exam);

    return this.getExam(examId);
  }

  public async getExam(examId: string): Promise<ExamResponseDto> {
    const cached = this.cache.getExam(examId);
    if (cached) return cached;

    const exam = await this.repository.findExamById(examId);
    if (!exam) {
      throw new Error(`EXAM_NOT_FOUND: Exam ${examId} not found`);
    }

    const sections = await this.repository.getSections(examId);
    const rules = (await this.repository.getRule(examId)) || undefined;
    const policy = (await this.repository.getPolicy(examId)) || undefined;
    const schedule = (await this.repository.getSchedule(examId)) || undefined;
    const eligibility = (await this.repository.getEligibility(examId)) || undefined;
    const configuration = (await this.repository.getConfiguration(examId)) || undefined;
    const publication = (await this.repository.getPublication(examId)) || undefined;

    const response: ExamResponseDto = {
      exam,
      sections,
      rules,
      policy,
      schedule,
      eligibility,
      configuration,
      publication
    };

    this.cache.setExam(examId, response);
    return response;
  }

  public async updateExam(examId: string, dto: UpdateExamDto): Promise<ExamResponseDto> {
    const updated = await this.repository.updateExam(examId, dto);
    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamUpdated(updated);
    return this.getExam(examId);
  }

  public async deleteExam(examId: string): Promise<void> {
    await this.repository.deleteExam(examId);
    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamDeleted(examId);
  }

  public async searchExams(queryDto: ExamSearchQueryDto): Promise<{ items: ExamResponseDto[]; total: number }> {
    const { items, total } = await this.repository.searchExams(queryDto);
    const responseList: ExamResponseDto[] = [];
    for (const e of items) {
      responseList.push(await this.getExam(e.examId));
    }
    return { items: responseList, total };
  }

  // --- 2. SCHEDULING ---
  public async scheduleExam(examId: string, dto: ScheduleExamDto): Promise<ExamResponseDto> {
    const exam = await this.repository.findExamById(examId);
    if (!exam) {
      throw new Error(`EXAM_NOT_FOUND: Exam ${examId} not found`);
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new Error('EXAM_INVALID_SCHEDULE: Start time must be before end time');
    }

    const schedule: ExamScheduleEntity = {
      scheduleId: generateUuid(),
      examId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      registrationWindowStart: dto.registrationWindowStart || start.toISOString(),
      registrationWindowEnd: dto.registrationWindowEnd || end.toISOString(),
      timezone: dto.timezone || 'UTC',
      lateEntryPolicy: dto.lateEntryPolicy || 'GRACE_PERIOD',
      gracePeriodMinutes: dto.gracePeriodMinutes || this.config.defaultGracePeriodMinutes
    };

    await this.repository.saveSchedule(schedule);
    await this.repository.updateExam(examId, { status: 'SCHEDULED' });

    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamScheduled(examId, schedule);

    return this.getExam(examId);
  }

  // --- 3. PUBLISHING & LIFECYCLE TRANSITIONS ---
  public async publishExam(examId: string, actorUserId: string, notes?: string): Promise<ExamResponseDto> {
    const exam = await this.repository.findExamById(examId);
    if (!exam) {
      throw new Error(`EXAM_NOT_FOUND: Exam ${examId} not found`);
    }

    const publication: ExamPublicationEntity = {
      publicationId: generateUuid(),
      examId,
      publishedById: actorUserId,
      publishedAt: new Date().toISOString(),
      approvalNotes: notes || null
    };

    await this.repository.savePublication(publication);
    await this.repository.updateExam(examId, { status: 'PUBLISHED' });

    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamPublished(examId, actorUserId);

    return this.getExam(examId);
  }

  public async archiveExam(examId: string): Promise<ExamResponseDto> {
    await this.repository.updateExam(examId, { status: 'ARCHIVED' });
    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamArchived(examId);
    return this.getExam(examId);
  }

  public async activateExam(examId: string): Promise<ExamResponseDto> {
    await this.repository.updateExam(examId, { status: 'ACTIVE' });
    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamStarted(examId);
    return this.getExam(examId);
  }

  public async deactivateExam(examId: string): Promise<ExamResponseDto> {
    await this.repository.updateExam(examId, { status: 'ENDED' });
    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamEnded(examId);
    return this.getExam(examId);
  }

  public async cancelExam(examId: string, reason?: string): Promise<ExamResponseDto> {
    await this.repository.updateExam(examId, { status: 'CANCELLED' });
    this.cache.invalidateAll(examId);
    await this.eventPublisher.publishExamCancelled(examId, reason);
    return this.getExam(examId);
  }

  public async duplicateExam(examId: string, newCode: string, actorUserId: string): Promise<ExamResponseDto> {
    const source = await this.getExam(examId);

    const duplicatedDto: CreateExamDto = {
      institutionId: source.exam.institutionId,
      code: newCode,
      title: `${source.exam.title} (Copy)`,
      description: source.exam.description || undefined,
      type: source.exam.type,
      difficultyLevel: source.exam.difficultyLevel,
      totalDurationMinutes: source.exam.totalDurationMinutes,
      totalPoints: source.exam.totalPoints,
      passingPercentage: source.exam.passingPercentage,
      maxAttemptsAllowed: source.exam.maxAttemptsAllowed,
      rules: source.rules,
      policy: source.policy,
      eligibility: source.eligibility,
      sections: source.sections?.map(s => ({
        title: s.title,
        instructions: s.instructions || undefined,
        durationMinutes: s.durationMinutes || undefined,
        questionPoolId: s.questionPoolId || undefined,
        weightPercentage: s.weightPercentage,
        isMandatory: s.isMandatory,
        isRandomized: s.isRandomized,
        sequenceOrder: s.sequenceOrder
      }))
    };

    return this.createExam(duplicatedDto, actorUserId);
  }

  // --- 4. RULES & AI PROCTORING POLICY ---
  public async updateRules(examId: string, dto: Partial<ExamRuleEntity>): Promise<ExamRuleEntity> {
    let rule = await this.repository.getRule(examId);
    if (!rule) {
      throw new Error(`EXAM_NOT_FOUND: Rules for exam ${examId} not found`);
    }

    rule = { ...rule, ...dto };
    await this.repository.saveRule(rule);
    this.cache.invalidateAll(examId);

    await this.eventPublisher.publishExamConfigurationChanged(examId, { rulesUpdated: true });
    return rule;
  }

  public async updatePolicy(examId: string, dto: Partial<ExamPolicyEntity>): Promise<ExamPolicyEntity> {
    let policy = await this.repository.getPolicy(examId);
    if (!policy) {
      throw new Error(`EXAM_NOT_FOUND: AI policy for exam ${examId} not found`);
    }

    policy = { ...policy, ...dto };
    await this.repository.savePolicy(policy);
    this.cache.invalidateAll(examId);

    await this.eventPublisher.publishExamConfigurationChanged(examId, { policyUpdated: true });
    return policy;
  }

  // --- 5. SECTIONS ---
  public async updateSections(examId: string, dtos: ExamSectionDto[]): Promise<ExamSectionEntity[]> {
    const sectionEntities: ExamSectionEntity[] = dtos.map((s, idx) => ({
      sectionId: generateUuid(),
      examId,
      title: s.title,
      instructions: s.instructions || null,
      durationMinutes: s.durationMinutes || null,
      questionPoolId: s.questionPoolId || null,
      weightPercentage: s.weightPercentage || Math.floor(100 / dtos.length),
      isMandatory: s.isMandatory ?? true,
      isRandomized: s.isRandomized ?? true,
      sequenceOrder: s.sequenceOrder || idx + 1
    }));

    await this.repository.setSections(examId, sectionEntities);
    this.cache.invalidateAll(examId);
    return sectionEntities;
  }

  // --- 6. ELIGIBILITY ENGINE ---
  public async updateEligibility(examId: string, dto: EligibilityCriteriaDto): Promise<ExamEligibilityEntity> {
    let eligibility = await this.repository.getEligibility(examId);
    if (!eligibility) {
      eligibility = {
        eligibilityId: generateUuid(),
        examId,
        allowedDepartmentIds: dto.allowedDepartmentIds || [],
        allowedCourseIds: dto.allowedCourseIds || [],
        allowedProgramIds: dto.allowedProgramIds || [],
        allowedBatchIds: dto.allowedBatchIds || [],
        candidateWhitelist: dto.candidateWhitelist || [],
        candidateBlacklist: dto.candidateBlacklist || []
      };
    } else {
      eligibility = {
        ...eligibility,
        allowedDepartmentIds: dto.allowedDepartmentIds || eligibility.allowedDepartmentIds,
        allowedCourseIds: dto.allowedCourseIds || eligibility.allowedCourseIds,
        allowedProgramIds: dto.allowedProgramIds || eligibility.allowedProgramIds,
        allowedBatchIds: dto.allowedBatchIds || eligibility.allowedBatchIds,
        candidateWhitelist: dto.candidateWhitelist || eligibility.candidateWhitelist,
        candidateBlacklist: dto.candidateBlacklist || eligibility.candidateBlacklist
      };
    }

    await this.repository.saveEligibility(eligibility);
    this.cache.invalidateAll(examId);
    return eligibility;
  }

  public async checkCandidateEligibility(
    examId: string,
    candidateId: string,
    candidateDepartmentId?: string
  ): Promise<{ eligible: boolean; reason?: string }> {
    const eligibility = await this.repository.getEligibility(examId);
    if (!eligibility) return { eligible: true };

    if (eligibility.candidateBlacklist.includes(candidateId)) {
      return { eligible: false, reason: 'Candidate is blacklisted from taking this exam' };
    }

    if (eligibility.candidateWhitelist.length > 0 && !eligibility.candidateWhitelist.includes(candidateId)) {
      return { eligible: false, reason: 'Candidate is not on the exam whitelist' };
    }

    if (
      eligibility.allowedDepartmentIds.length > 0 &&
      candidateDepartmentId &&
      !eligibility.allowedDepartmentIds.includes(candidateDepartmentId)
    ) {
      return { eligible: false, reason: 'Candidate department is not eligible for this exam' };
    }

    return { eligible: true };
  }

  // --- 7. EXAM TEMPLATES ---
  public async createTemplate(
    institutionId: string,
    name: string,
    description: string | undefined,
    actorUserId: string
  ): Promise<ExamTemplateEntity> {
    const template: ExamTemplateEntity = {
      templateId: generateUuid(),
      institutionId,
      name: name.trim(),
      description: description || null,
      createdById: actorUserId,
      createdAt: new Date().toISOString()
    };
    return this.repository.createTemplate(template);
  }
}
