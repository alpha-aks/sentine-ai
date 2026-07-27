import assert from 'assert';
import { test, describe, beforeEach } from 'node:test';
import { ExamCache } from '../cache/ExamCache';
import { ExamRepository } from '../db/ExamRepository';
import { ExamService } from '../services/ExamService';

describe('Exam Service Suite', () => {
  let repository: ExamRepository;
  let cache: ExamCache;
  let service: ExamService;

  beforeEach(() => {
    repository = new ExamRepository();
    cache = new ExamCache(300);
    service = new ExamService(repository, cache);
  });

  test('1. Create Exam & Provisions Default Rules, Policy, Config', async () => {
    const response = await service.createExam(
      {
        institutionId: 'inst_mit',
        code: 'CS101_MIDTERM',
        title: 'Intro to Computer Science Midterm',
        totalDurationMinutes: 90,
        passingPercentage: 70,
        sections: [
          { title: 'Multiple Choice', weightPercentage: 40 },
          { title: 'Coding Challenge', weightPercentage: 60 }
        ]
      },
      'admin_user_01'
    );

    assert.strictEqual(response.exam.code, 'CS101_MIDTERM');
    assert.strictEqual(response.exam.status, 'DRAFT');
    assert.strictEqual(response.sections?.length, 2);
    assert.ok(response.rules);
    assert.strictEqual(response.rules.browserLockEnabled, true);
    assert.ok(response.policy);
    assert.strictEqual(response.policy.sensitivityProfile, 'STANDARD');
  });

  test('2. Exam Scheduling & Window Validation', async () => {
    const created = await service.createExam(
      {
        institutionId: 'inst_mit',
        code: 'MATH201_FINAL',
        title: 'Linear Algebra Final',
        totalDurationMinutes: 120
      },
      'admin_user_01'
    );

    const now = new Date();
    const startTime = new Date(now.getTime() + 86400000).toISOString(); // Tomorrow
    const endTime = new Date(now.getTime() + 86400000 + 7200000).toISOString(); // Tomorrow + 2h

    const scheduled = await service.scheduleExam(created.exam.examId, {
      startTime,
      endTime,
      timezone: 'America/New_York',
      lateEntryPolicy: 'GRACE_PERIOD',
      gracePeriodMinutes: 15
    });

    assert.strictEqual(scheduled.exam.status, 'SCHEDULED');
    assert.ok(scheduled.schedule);
    assert.strictEqual(scheduled.schedule.gracePeriodMinutes, 15);
  });

  test('3. Exam Publishing & Lifecycle Transitions', async () => {
    const created = await service.createExam(
      {
        institutionId: 'inst_mit',
        code: 'PHYS301',
        title: 'Quantum Mechanics Exam',
        totalDurationMinutes: 180
      },
      'admin_user_01'
    );

    const published = await service.publishExam(created.exam.examId, 'admin_user_01', 'Approved by Dean');
    assert.strictEqual(published.exam.status, 'PUBLISHED');
    assert.ok(published.publication);
    assert.strictEqual(published.publication.approvalNotes, 'Approved by Dean');

    const activated = await service.activateExam(created.exam.examId);
    assert.strictEqual(activated.exam.status, 'ACTIVE');

    const deactivated = await service.deactivateExam(created.exam.examId);
    assert.strictEqual(deactivated.exam.status, 'ENDED');
  });

  test('4. Exam Duplication (Deep Clone)', async () => {
    const original = await service.createExam(
      {
        institutionId: 'inst_mit',
        code: 'BIO101_QUIZ',
        title: 'Biology Quiz 1',
        totalDurationMinutes: 30
      },
      'admin_user_01'
    );

    const copy = await service.duplicateExam(original.exam.examId, 'BIO101_QUIZ_CLONE', 'admin_user_01');
    assert.strictEqual(copy.exam.code, 'BIO101_QUIZ_CLONE');
    assert.ok(copy.exam.title.includes('(Copy)'));
    assert.strictEqual(copy.exam.status, 'DRAFT');
  });

  test('5. Candidate Eligibility Engine (Whitelist & Blacklist)', async () => {
    const created = await service.createExam(
      {
        institutionId: 'inst_mit',
        code: 'CHEM101',
        title: 'Chemistry Exam',
        totalDurationMinutes: 60
      },
      'admin_user_01'
    );

    await service.updateEligibility(created.exam.examId, {
      candidateWhitelist: ['user_student_01', 'user_student_02'],
      candidateBlacklist: ['user_cheater_99']
    });

    const checkWhitelisted = await service.checkCandidateEligibility(created.exam.examId, 'user_student_01');
    assert.strictEqual(checkWhitelisted.eligible, true);

    const checkNotWhitelisted = await service.checkCandidateEligibility(created.exam.examId, 'user_student_03');
    assert.strictEqual(checkNotWhitelisted.eligible, false);

    const checkBlacklisted = await service.checkCandidateEligibility(created.exam.examId, 'user_cheater_99');
    assert.strictEqual(checkBlacklisted.eligible, false);
  });
});
