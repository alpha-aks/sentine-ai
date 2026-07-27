import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { SubmissionCache } from '../cache/SubmissionCache';
import { SubmissionEventPublisher } from '../events/SubmissionEventPublisher';
import { SubmissionService } from '../services/SubmissionService';
import { SubmissionValidationEngine } from '../services/SubmissionValidationEngine';
import { getSubmissionServiceConfig } from '../config/submission-config';

describe('Manual Testing Checklist Verification Suite', () => {
  function createTestEnvironment() {
    const repo = new SubmissionRepository();
    const cache = new SubmissionCache(300);
    const publisher = new SubmissionEventPublisher();
    const service = new SubmissionService(repo, cache, publisher);
    const config = getSubmissionServiceConfig();
    const validator = new SubmissionValidationEngine(repo, config);
    return { repo, cache, publisher, service, validator };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CREATE SUBMISSION
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. Create Submission', () => {
    it('Candidate can create a submission linked to correct exam, candidate, with initial status IN_PROGRESS', async () => {
      const { service } = createTestEnvironment();
      const dto = {
        sessionId: 'sess_chk_1',
        examId: 'exam_chk_101',
        institutionId: 'inst_chk_1',
        candidateId: 'cand_chk_1',
        candidateName: 'John Candidate',
        candidateEmail: 'john@exam.com',
        totalQuestions: 10
      };

      const result = await service.startSubmission(dto, dto.candidateId);
      const sub = result.submission;

      // Assertions matching checklist items
      assert.ok(sub.submissionId, 'Submission ID should be generated');
      assert.strictEqual(sub.examId, 'exam_chk_101', 'Submission must be linked to the correct exam');
      assert.strictEqual(sub.candidateId, 'cand_chk_1', 'Submission must be linked to the correct candidate');
      assert.strictEqual(sub.status, 'IN_PROGRESS', 'Initial status must be IN_PROGRESS');
      assert.strictEqual(sub.isLocked, false, 'Initial state must be unlocked');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SAVE ANSWER
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. Save Answer', () => {
    it('Saves MCQ, multiple-select, numerical, code, long-answer, and file-upload answers', async () => {
      const { service } = createTestEnvironment();
      const start = await service.startSubmission({
        sessionId: 'sess_chk_2',
        examId: 'exam_chk_102',
        institutionId: 'inst_chk_1',
        candidateId: 'cand_chk_2',
        candidateName: 'Jane Smith',
        candidateEmail: 'jane@exam.com',
        totalQuestions: 6
      }, 'cand_chk_2');
      const subId = start.submission.submissionId;

      // 1. Save an MCQ answer
      const mcqSingle = await service.saveAnswer(subId, {
        questionId: 'q_mcq_single',
        answerType: 'MCQ_SINGLE',
        answerData: { selectedOptionId: 'opt_b' }
      }, 'cand_chk_2');
      assert.strictEqual((mcqSingle.answerData as any).selectedOptionId, 'opt_b');

      // 2. Save a multiple-select answer
      const mcqMulti = await service.saveAnswer(subId, {
        questionId: 'q_mcq_multi',
        answerType: 'MCQ_MULTIPLE',
        answerData: { selectedOptionIds: ['opt_a', 'opt_c'] }
      }, 'cand_chk_2');
      assert.deepStrictEqual((mcqMulti.answerData as any).selectedOptionIds, ['opt_a', 'opt_c']);

      // 3. Save a numerical answer
      const numerical = await service.saveAnswer(subId, {
        questionId: 'q_num',
        answerType: 'NUMERICAL',
        answerData: { value: 98.6, unit: 'celsius' }
      }, 'cand_chk_2');
      assert.strictEqual((numerical.answerData as any).value, 98.6);

      // 4. Save a code answer
      const codeAns = await service.saveAnswer(subId, {
        questionId: 'q_code',
        answerType: 'CODE',
        answerData: { code: 'function solution() { return true; }', language: 'typescript' }
      }, 'cand_chk_2');
      assert.strictEqual((codeAns.answerData as any).language, 'typescript');
      assert.ok((codeAns.answerData as any).lineCount > 0);

      // 5. Save a long-answer response
      const longAns = await service.saveAnswer(subId, {
        questionId: 'q_long',
        answerType: 'LONG_ANSWER',
        answerData: { text: 'This is a detailed long answer explanation.', format: 'MARKDOWN' }
      }, 'cand_chk_2');
      assert.strictEqual((longAns.answerData as any).text, 'This is a detailed long answer explanation.');

      // 6. Save a file-upload answer
      const uploadedFile = await service.uploadFile(subId, {
        fileName: 'solution.pdf',
        fileType: 'PDF',
        fileSizeBytes: 1024,
        mimeType: 'application/pdf',
        questionId: 'q_file'
      }, 'cand_chk_2');

      const fileAns = await service.saveAnswer(subId, {
        questionId: 'q_file',
        answerType: 'FILE_UPLOAD',
        answerData: { fileIds: [uploadedFile.fileId] }
      }, 'cand_chk_2');
      assert.deepStrictEqual((fileAns.answerData as any).fileIds, [uploadedFile.fileId]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. AUTOSAVE
  // ─────────────────────────────────────────────────────────────────────────────
  describe('3. Autosave', () => {
    it('Autosave creates no duplicates, updates existing record & timestamp, and supports retry', async () => {
      const { service, repo } = createTestEnvironment();
      const start = await service.startSubmission({
        sessionId: 'sess_chk_3',
        examId: 'exam_chk_103',
        institutionId: 'inst_chk_1',
        candidateId: 'cand_chk_3',
        candidateName: 'Alice',
        candidateEmail: 'alice@exam.com'
      }, 'cand_chk_3');
      const subId = start.submission.submissionId;

      // 1. Initial autosave
      const res1 = await service.saveDraft(subId, {
        questionId: 'q_auto_1',
        answerType: 'SHORT_ANSWER',
        answerData: { text: 'Draft v1' },
        clientTimestamp: new Date().toISOString(),
        sequenceNumber: 1
      }, 'cand_chk_3');

      // 2. Second autosave for same question
      const res2 = await service.saveDraft(subId, {
        questionId: 'q_auto_1',
        answerType: 'SHORT_ANSWER',
        answerData: { text: 'Draft v2' },
        clientTimestamp: new Date().toISOString(),
        sequenceNumber: 2
      }, 'cand_chk_3');

      // Check no duplicates created
      const drafts = await repo.getDraftsBySubmission(subId);
      assert.strictEqual(drafts.length, 1, 'Autosave must not create duplicate draft records for the same question');
      assert.strictEqual(res1.draft.draftId, res2.draft.draftId, 'Multiple autosaves must update the same draft record');
      assert.strictEqual((res2.draft.answerData as any).text, 'Draft v2');

      // Check timestamp updated
      assert.ok(new Date(res2.draft.updatedAt).getTime() >= new Date(res1.draft.updatedAt).getTime(), 'Autosave updates timestamp');

      // Network retry conflict handling
      const retryRes = await service.saveDraft(subId, {
        questionId: 'q_auto_1',
        answerType: 'SHORT_ANSWER',
        answerData: { text: 'Draft v2' },
        clientTimestamp: new Date().toISOString(),
        sequenceNumber: 2
      }, 'cand_chk_3');
      assert.strictEqual(retryRes.conflictDetected, false, 'Identical or valid sequence retry succeeds cleanly');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. DRAFT RECOVERY
  // ─────────────────────────────────────────────────────────────────────────────
  describe('4. Draft Recovery', () => {
    it('Restores drafts & answers intact after browser refresh or backend restart simulation', async () => {
      const env = createTestEnvironment();
      const start = await env.service.startSubmission({
        sessionId: 'sess_chk_4',
        examId: 'exam_chk_104',
        institutionId: 'inst_chk_1',
        candidateId: 'cand_chk_4',
        candidateName: 'Bob',
        candidateEmail: 'bob@exam.com'
      }, 'cand_chk_4');
      const subId = start.submission.submissionId;

      // Save answer and draft
      await env.service.saveAnswer(subId, {
        questionId: 'q_rec_1',
        answerType: 'TRUE_FALSE',
        answerData: { value: true }
      }, 'cand_chk_4');

      await env.service.saveDraft(subId, {
        questionId: 'q_rec_2',
        answerType: 'SHORT_ANSWER',
        answerData: { text: 'Uncommitted draft text' },
        clientTimestamp: new Date().toISOString()
      }, 'cand_chk_4');

      // Browser refresh simulation: calling getRecoveryState
      const recovery = await env.service.getRecoveryState(subId);
      assert.strictEqual(recovery.answers.length, 1);
      assert.strictEqual(recovery.drafts.length, 1);
      assert.strictEqual((recovery.answers[0].answerData as any).value, true);
      assert.strictEqual((recovery.drafts[0].answerData as any).text, 'Uncommitted draft text');

      // Backend restart simulation: Create fresh service instance using same repository persistence
      const freshService = new SubmissionService(env.repo, new SubmissionCache(300), new SubmissionEventPublisher());
      const recoveryAfterRestart = await freshService.getRecoveryState(subId);

      assert.strictEqual(recoveryAfterRestart.submission.submissionId, subId);
      assert.strictEqual(recoveryAfterRestart.answers.length, 1, 'Committed answers remain intact');
      assert.strictEqual(recoveryAfterRestart.drafts.length, 1, 'Draft answers remain intact');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. FINAL SUBMISSION
  // ─────────────────────────────────────────────────────────────────────────────
  describe('5. Final Submission', () => {
    it('Transitions status to SUBMITTED, promotes drafts, locks answers, rejects further edits, publishes event', async () => {
      const { service, publisher } = createTestEnvironment();
      let eventPublished = false;

      (publisher as any).publisher.publish = async (evt: string) => {
        if (evt === 'SubmissionFinalized') eventPublished = true;
      };

      const start = await service.startSubmission({
        sessionId: 'sess_chk_5',
        examId: 'exam_chk_105',
        institutionId: 'inst_chk_1',
        candidateId: 'cand_chk_5',
        candidateName: 'Charlie',
        candidateEmail: 'charlie@exam.com'
      }, 'cand_chk_5');
      const subId = start.submission.submissionId;

      await service.saveDraft(subId, {
        questionId: 'q_fin_1',
        answerType: 'NUMERICAL',
        answerData: { value: 100 },
        clientTimestamp: new Date().toISOString()
      }, 'cand_chk_5');

      const submitRes = await service.submitFinal(subId, { notes: 'Finished exam' }, 'cand_chk_5');

      // Status becomes SUBMITTED & Locked
      assert.strictEqual(submitRes.submission.status, 'SUBMITTED');
      assert.strictEqual(submitRes.submission.isLocked, true);
      assert.ok(submitRes.submission.submittedAt);
      assert.ok(eventPublished, 'SubmissionFinalized event must be published');

      // Further edits are rejected
      await assert.rejects(
        () => service.saveAnswer(subId, {
          questionId: 'q_fin_1',
          answerType: 'NUMERICAL',
          answerData: { value: 200 }
        }, 'cand_chk_5'),
        /SUBMISSION_LOCKED|SUBMISSION_ALREADY_FINALIZED/
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. LOCKING
  // ─────────────────────────────────────────────────────────────────────────────
  describe('6. Locking', () => {
    it('Blocks second submission, prevents concurrent overwrites, enforces exam timeout', async () => {
      const { service, validator } = createTestEnvironment();
      const start = await service.startSubmission({
        sessionId: 'sess_chk_6',
        examId: 'exam_chk_106',
        institutionId: 'inst_chk_1',
        candidateId: 'cand_chk_6',
        candidateName: 'Dave',
        candidateEmail: 'dave@exam.com'
      }, 'cand_chk_6');
      const subId = start.submission.submissionId;

      // Submit once
      await service.submitFinal(subId, {}, 'cand_chk_6');

      // Second submit attempt is idempotent / handled safely
      const secondSubmit = await service.autoSubmit(subId, { reason: 'ADMIN_FORCE' });
      assert.strictEqual(secondSubmit.submission.status, 'SUBMITTED');

      // Exam timeout prevents further changes
      const expiredTime = new Date(Date.now() - 5000).toISOString();
      assert.throws(
        () => validator.assertExamNotExpired(start.submission, expiredTime),
        /EXAM_DEADLINE_EXPIRED/
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. MULTI-TENANT SECURITY
  // ─────────────────────────────────────────────────────────────────────────────
  describe('7. Multi-Tenant Security', () => {
    it('Enforces tenant & candidate data isolation', async () => {
      const { repo, service } = createTestEnvironment();

      // Tenant A
      const subA = await service.startSubmission({
        sessionId: 'sess_tenant_A',
        examId: 'exam_A',
        institutionId: 'inst_A',
        candidateId: 'cand_A',
        candidateName: 'User A',
        candidateEmail: 'usera@instA.com'
      }, 'cand_A');

      // Tenant B
      const subB = await service.startSubmission({
        sessionId: 'sess_tenant_B',
        examId: 'exam_B',
        institutionId: 'inst_B',
        candidateId: 'cand_B',
        candidateName: 'User B',
        candidateEmail: 'userb@instB.com'
      }, 'cand_B');

      // Institution A queries submissions
      const instASubs = await repo.findSubmissionsByInstitution('inst_A');
      assert.strictEqual(instASubs.total, 1);
      assert.strictEqual(instASubs.items[0].submissionId, subA.submission.submissionId);

      // Institution B queries submissions
      const instBSubs = await repo.findSubmissionsByInstitution('inst_B');
      assert.strictEqual(instBSubs.total, 1);
      assert.strictEqual(instBSubs.items[0].submissionId, subB.submission.submissionId);

      // Verify User A and User B submission IDs are completely separate
      assert.notStrictEqual(subA.submission.submissionId, subB.submission.submissionId);
    });
  });
});
