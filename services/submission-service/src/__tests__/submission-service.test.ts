import assert from 'assert';
import { test, describe, beforeEach } from 'node:test';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { SubmissionCache } from '../cache/SubmissionCache';
import { SubmissionEventPublisher } from '../events/SubmissionEventPublisher';
import { SubmissionService } from '../services/SubmissionService';
import { CodeAnswerEngine } from '../services/CodeAnswerEngine';
import { StartSubmissionDto } from '../types/submission';

function makeService(): { service: SubmissionService; repo: SubmissionRepository; cache: SubmissionCache } {
  const repo = new SubmissionRepository();
  const cache = new SubmissionCache(300);
  const service = new SubmissionService(repo, cache, new SubmissionEventPublisher());
  return { service, repo, cache };
}

const DEFAULT_START: StartSubmissionDto = {
  sessionId: 'sess_1001',
  examId: 'exam_2002',
  institutionId: 'inst_3003',
  candidateId: 'cand_4004',
  candidateName: 'John Doe',
  candidateEmail: 'john@example.com',
  totalQuestions: 5
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUBMISSION INITIALIZATION & START
// ─────────────────────────────────────────────────────────────────────────────

describe('1. Submission Initialization & Start', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('1.1 startSubmission creates submission in IN_PROGRESS state', async () => {
    const res = await service.startSubmission(DEFAULT_START, 'cand_4004');
    assert.ok(res.submission.submissionId);
    assert.strictEqual(res.submission.status, 'IN_PROGRESS');
    assert.strictEqual(res.submission.sessionId, DEFAULT_START.sessionId);
    assert.strictEqual(res.submission.isLocked, false);
    assert.strictEqual(res.submission.totalAnswers, 5);
  });

  test('1.2 Idempotent startSubmission returns existing submission', async () => {
    const res1 = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const res2 = await service.startSubmission(DEFAULT_START, 'cand_4004');
    assert.strictEqual(res1.submission.submissionId, res2.submission.submissionId);
  });

  test('1.3 Missing required fields in startSubmission throws SUBMISSION_INVALID_INPUT', async () => {
    await assert.rejects(
      () => service.startSubmission({ ...DEFAULT_START, sessionId: '' }, 'cand_4004'),
      /SUBMISSION_INVALID_INPUT/
    );
    await assert.rejects(
      () => service.startSubmission({ ...DEFAULT_START, examId: '' }, 'cand_4004'),
      /SUBMISSION_INVALID_INPUT/
    );
    await assert.rejects(
      () => service.startSubmission({ ...DEFAULT_START, candidateId: '' }, 'cand_4004'),
      /SUBMISSION_INVALID_INPUT/
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ANSWER SAVING ACROSS MULTIPLE TYPES
// ─────────────────────────────────────────────────────────────────────────────

describe('2. Answer Saving Across Multiple Types', () => {
  let subService: SubmissionService;

  beforeEach(() => { ({ service: subService } = makeService()); });

  test('2.1 Save MCQ_SINGLE answer', async () => {
    const { submission } = await subService.startSubmission(DEFAULT_START, 'cand_4004');
    const answer = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_1',
      answerType: 'MCQ_SINGLE',
      answerData: { selectedOptionId: 'opt_A' }
    }, 'cand_4004');

    assert.strictEqual(answer.questionId, 'q_1');
    assert.strictEqual(answer.answerType, 'MCQ_SINGLE');
    assert.strictEqual((answer.answerData as any).selectedOptionId, 'opt_A');
    assert.strictEqual(answer.version, 1);
  });

  test('2.2 Save MCQ_MULTIPLE answer', async () => {
    const { submission } = await subService.startSubmission(DEFAULT_START, 'cand_4004');
    const answer = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_2',
      answerType: 'MCQ_MULTIPLE',
      answerData: { selectedOptionIds: ['opt_A', 'opt_C'] }
    }, 'cand_4004');

    assert.strictEqual(answer.answerType, 'MCQ_MULTIPLE');
    assert.deepStrictEqual((answer.answerData as any).selectedOptionIds, ['opt_A', 'opt_C']);
  });

  test('2.3 Save TRUE_FALSE answer', async () => {
    const { submission } = await subService.startSubmission(DEFAULT_START, 'cand_4004');
    const answer = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_3',
      answerType: 'TRUE_FALSE',
      answerData: { value: true }
    }, 'cand_4004');

    assert.strictEqual((answer.answerData as any).value, true);
  });

  test('2.4 Save SHORT_ANSWER & LONG_ANSWER text answers', async () => {
    const { submission } = await subService.startSubmission(DEFAULT_START, 'cand_4004');
    const ansShort = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_4',
      answerType: 'SHORT_ANSWER',
      answerData: { text: 'Brief response' }
    }, 'cand_4004');

    const ansLong = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_5',
      answerType: 'LONG_ANSWER',
      answerData: { text: '<p>Detailed essay response...</p>', format: 'RICH_TEXT' }
    }, 'cand_4004');

    assert.strictEqual((ansShort.answerData as any).text, 'Brief response');
    assert.strictEqual((ansLong.answerData as any).format, 'RICH_TEXT');
  });

  test('2.5 Save NUMERICAL answer', async () => {
    const { submission } = await subService.startSubmission(DEFAULT_START, 'cand_4004');
    const answer = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_num',
      answerType: 'NUMERICAL',
      answerData: { value: 42.5, unit: 'kg' }
    }, 'cand_4004');

    assert.strictEqual((answer.answerData as any).value, 42.5);
    assert.strictEqual((answer.answerData as any).unit, 'kg');
  });

  test('2.6 Save MATCHING & ORDERING answers', async () => {
    const { submission } = await subService.startSubmission(DEFAULT_START, 'cand_4004');
    const ansMatching = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_match',
      answerType: 'MATCHING',
      answerData: { pairs: [{ leftId: 'l1', rightId: 'r1' }] }
    }, 'cand_4004');

    const ansOrdering = await subService.saveAnswer(submission.submissionId, {
      questionId: 'q_order',
      answerType: 'ORDERING',
      answerData: { orderedIds: ['item3', 'item1', 'item2'] }
    }, 'cand_4004');

    assert.strictEqual(ansMatching.answerType, 'MATCHING');
    assert.deepStrictEqual((ansOrdering.answerData as any).orderedIds, ['item3', 'item1', 'item2']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. DRAFT ANSWERS & AUTOSAVE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

describe('3. Draft Answers & Autosave Engine', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('3.1 Save draft creates draft entity with isDirty=true', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const { draft } = await service.saveDraft(submission.submissionId, {
      questionId: 'q_draft_1',
      answerType: 'SHORT_ANSWER',
      answerData: { text: 'Incomplete draft...' },
      clientTimestamp: new Date().toISOString()
    }, 'cand_4004');

    assert.ok(draft.draftId);
    assert.strictEqual(draft.isDirty, true);
    assert.strictEqual((draft.answerData as any).text, 'Incomplete draft...');
  });

  test('3.2 Consecutive drafts increment sequence number', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const d1 = await service.saveDraft(submission.submissionId, {
      questionId: 'q_draft_seq',
      answerType: 'SHORT_ANSWER',
      answerData: { text: 'V1' },
      clientTimestamp: new Date().toISOString()
    }, 'cand_4004');

    const d2 = await service.saveDraft(submission.submissionId, {
      questionId: 'q_draft_seq',
      answerType: 'SHORT_ANSWER',
      answerData: { text: 'V2' },
      clientTimestamp: new Date().toISOString()
    }, 'cand_4004');

    assert.strictEqual(d1.draft.sequenceNumber, 1);
    assert.strictEqual(d2.draft.sequenceNumber, 2);
  });

  test('3.3 Batch autosave saves multiple drafts', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const batchRes = await service.batchAutosave(submission.submissionId, {
      drafts: [
        { questionId: 'q_b1', answerType: 'MCQ_SINGLE', answerData: { selectedOptionId: 'opt_1' }, clientTimestamp: new Date().toISOString() },
        { questionId: 'q_b2', answerType: 'TRUE_FALSE', answerData: { value: false }, clientTimestamp: new Date().toISOString() }
      ]
    }, 'cand_4004');

    assert.strictEqual(batchRes.savedCount, 2);
    assert.strictEqual(batchRes.conflicts.length, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANSWER VERSIONING & HISTORY
// ─────────────────────────────────────────────────────────────────────────────

describe('4. Answer Versioning & History', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('4.1 Multiple manual saves create version history entries', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');

    await service.saveAnswer(submission.submissionId, {
      questionId: 'q_v',
      answerType: 'SHORT_ANSWER',
      answerData: { text: 'First attempt' }
    }, 'cand_4004');

    await service.saveAnswer(submission.submissionId, {
      questionId: 'q_v',
      answerType: 'SHORT_ANSWER',
      answerData: { text: 'Second attempt' }
    }, 'cand_4004');

    const versions = await service.getAnswerVersions(submission.submissionId, 'q_v');
    assert.strictEqual(versions.length, 2);
    assert.strictEqual(versions[0].versionNumber, 1);
    assert.strictEqual((versions[0].answerData as any).text, 'First attempt');
    assert.strictEqual(versions[1].versionNumber, 2);
    assert.strictEqual((versions[1].answerData as any).text, 'Second attempt');
  });

  test('4.2 Save source is recorded in version history', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');

    await service.saveAnswer(submission.submissionId, {
      questionId: 'q_v_src',
      answerType: 'TRUE_FALSE',
      answerData: { value: true }
    }, 'cand_4004');

    const versions = await service.getAnswerVersions(submission.submissionId, 'q_v_src');
    assert.strictEqual(versions[0].saveSource, 'MANUAL');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. FILE UPLOADS
// ─────────────────────────────────────────────────────────────────────────────

describe('5. File Upload Answers & Validation', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('5.1 Process file upload successfully', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const file = await service.uploadFile(submission.submissionId, {
      fileName: 'diagram.png',
      fileType: 'IMAGE',
      fileSizeBytes: 102400,
      mimeType: 'image/png',
      contentBase64: Buffer.from('mock png bytes').toString('base64')
    }, 'cand_4004');

    assert.ok(file.fileId);
    assert.strictEqual(file.fileName, 'diagram.png');
    assert.strictEqual(file.virusScanPassed, true);
    assert.ok(file.contentHash);
  });

  test('5.2 Zero byte file upload throws SUBMISSION_INVALID_FILE', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await assert.rejects(
      () => service.uploadFile(submission.submissionId, {
        fileName: 'empty.txt', fileType: 'DOCUMENT', fileSizeBytes: 0, mimeType: 'text/plain'
      }, 'cand_4004'),
      /SUBMISSION_INVALID_FILE/
    );
  });

  test('5.3 File exceeding size limit throws SUBMISSION_FILE_TOO_LARGE', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await assert.rejects(
      () => service.uploadFile(submission.submissionId, {
        fileName: 'huge.zip', fileType: 'ZIP', fileSizeBytes: 50 * 1024 * 1024, mimeType: 'application/zip'
      }, 'cand_4004'),
      /SUBMISSION_FILE_TOO_LARGE/
    );
  });

  test('5.4 Duplicate content upload returns existing file', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const base64Data = Buffer.from('unique content 123').toString('base64');

    const file1 = await service.uploadFile(submission.submissionId, {
      fileName: 'doc1.pdf', fileType: 'PDF', fileSizeBytes: 5000, mimeType: 'application/pdf', contentBase64: base64Data
    }, 'cand_4004');

    const file2 = await service.uploadFile(submission.submissionId, {
      fileName: 'doc1_copy.pdf', fileType: 'PDF', fileSizeBytes: 5000, mimeType: 'application/pdf', contentBase64: base64Data
    }, 'cand_4004');

    assert.strictEqual(file1.fileId, file2.fileId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. CODE ANSWERS
// ─────────────────────────────────────────────────────────────────────────────

describe('6. Code Answers Support', () => {
  let service: SubmissionService;
  let codeEngine: CodeAnswerEngine;

  beforeEach(() => {
    ({ service } = makeService());
    codeEngine = new CodeAnswerEngine();
  });

  test('6.1 Process code answer calculates line count', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const codeText = 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))';
    const answer = await service.saveAnswer(submission.submissionId, {
      questionId: 'q_code',
      answerType: 'CODE',
      answerData: { code: codeText, language: 'python' }
    }, 'cand_4004');

    const data = answer.answerData as any;
    assert.strictEqual(data.language, 'python');
    assert.strictEqual(data.lineCount, 4);
  });

  test('6.2 Multi-file code answer supported', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const answer = await service.saveAnswer(submission.submissionId, {
      questionId: 'q_code_multi',
      answerType: 'CODE',
      answerData: {
        code: 'import ./utils',
        language: 'typescript',
        files: [
          { filename: 'index.ts', content: 'console.log("main")', language: 'typescript' },
          { filename: 'utils.ts', content: 'export const x = 1', language: 'typescript' }
        ]
      }
    }, 'cand_4004');

    const data = answer.answerData as any;
    assert.strictEqual(data.files.length, 2);
    assert.strictEqual(data.files[1].filename, 'utils.ts');
  });

  test('6.3 CodeEngine generates starter templates', () => {
    const pyTemplate = codeEngine.getStarterTemplate('python');
    const jsTemplate = codeEngine.getStarterTemplate('javascript');
    assert.ok(pyTemplate.includes('def main():'));
    assert.ok(jsTemplate.includes('function main()'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. SUBMISSION LOCKING & FINALIZATION
// ─────────────────────────────────────────────────────────────────────────────

describe('7. Submission Locking & Finalization', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('7.1 Final submit promotes drafts and locks submission', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await service.saveDraft(submission.submissionId, {
      questionId: 'q_1', answerType: 'MCQ_SINGLE', answerData: { selectedOptionId: 'opt_A' }, clientTimestamp: new Date().toISOString()
    }, 'cand_4004');

    const res = await service.submitFinal(submission.submissionId, { notes: 'Finished exam' }, 'cand_4004');

    assert.strictEqual(res.submission.status, 'SUBMITTED');
    assert.strictEqual(res.submission.isLocked, true);
    assert.ok(res.submission.submittedAt);
  });

  test('7.2 Cannot save answer to SUBMITTED submission', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await service.submitFinal(submission.submissionId, {}, 'cand_4004');

    await assert.rejects(
      () => service.saveAnswer(submission.submissionId, {
        questionId: 'q_late', answerType: 'SHORT_ANSWER', answerData: { text: 'Late text' }
      }, 'cand_4004'),
      /SUBMISSION_ALREADY_FINALIZED|SUBMISSION_LOCKED/
    );
  });

  test('7.3 Manual lock prevents modifications', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await service.lockSubmission(submission.submissionId, { reason: 'Proctor lock' }, 'proctor1');

    await assert.rejects(
      () => service.saveAnswer(submission.submissionId, {
        questionId: 'q_after_lock', answerType: 'TRUE_FALSE', answerData: { value: true }
      }, 'cand_4004'),
      /SUBMISSION_LOCKED/
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. AUTO-SUBMIT WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

describe('8. Auto-Submit Workflow', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('8.1 Auto-submit on TIMER_EXPIRED promotes drafts & locks', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await service.saveDraft(submission.submissionId, {
      questionId: 'q_auto_1', answerType: 'NUMERICAL', answerData: { value: 100 }, clientTimestamp: new Date().toISOString()
    }, 'cand_4004');

    const res = await service.autoSubmit(submission.submissionId, { reason: 'TIMER_EXPIRED' });
    assert.strictEqual(res.submission.status, 'AUTO_SUBMITTED');
    assert.strictEqual(res.submission.isLocked, true);
    assert.ok(res.submission.lockReason?.includes('TIMER_EXPIRED'));
  });

  test('8.2 Auto-submit is idempotent on already submitted submission', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await service.submitFinal(submission.submissionId, {}, 'cand_4004');

    const res = await service.autoSubmit(submission.submissionId, { reason: 'TIMER_EXPIRED' });
    assert.strictEqual(res.submission.status, 'SUBMITTED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. SUBMISSION RECOVERY
// ─────────────────────────────────────────────────────────────────────────────

describe('9. Submission Recovery', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('9.1 getRecoveryState restores answers, drafts, and files', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');

    await service.saveAnswer(submission.submissionId, {
      questionId: 'q_rec_1', answerType: 'MCQ_SINGLE', answerData: { selectedOptionId: 'opt_X' }
    }, 'cand_4004');

    await service.saveDraft(submission.submissionId, {
      questionId: 'q_rec_2', answerType: 'SHORT_ANSWER', answerData: { text: 'Draft text' }, clientTimestamp: new Date().toISOString()
    }, 'cand_4004');

    const recovery = await service.getRecoveryState(submission.submissionId);
    assert.strictEqual(recovery.submission.submissionId, submission.submissionId);
    assert.strictEqual(recovery.answers.length, 1);
    assert.strictEqual(recovery.drafts.length, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. SUBMISSION VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────

describe('10. Submission Validation Rules', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('10.1 validateSubmission identifies unanswered required questions', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    await service.saveAnswer(submission.submissionId, {
      questionId: 'q_req_1', answerType: 'TRUE_FALSE', answerData: { value: true }
    }, 'cand_4004');

    const result = await service.validateSubmission(submission.submissionId, ['q_req_1', 'q_req_2']);
    assert.strictEqual(result.answeredQuestions, 1);
    assert.strictEqual(result.missingRequiredQuestionIds.length, 1);
    assert.strictEqual(result.missingRequiredQuestionIds[0], 'q_req_2');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. TENANT ISOLATION
// ─────────────────────────────────────────────────────────────────────────────

describe('11. Tenant Isolation', () => {
  let service: SubmissionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('11.1 Submissions from different institutions are isolated', async () => {
    await service.startSubmission({ ...DEFAULT_START, institutionId: 'inst_A', examId: 'exam_A', candidateId: 'cA', sessionId: 'sA' }, 'u1');
    await service.startSubmission({ ...DEFAULT_START, institutionId: 'inst_B', examId: 'exam_B', candidateId: 'cB', sessionId: 'sB' }, 'u1');

    const listA = await service.listSubmissionsByExam('exam_A');
    const listB = await service.listSubmissionsByExam('exam_B');

    assert.strictEqual(listA.length, 1);
    assert.strictEqual(listA[0].institutionId, 'inst_A');
    assert.strictEqual(listB.length, 1);
    assert.strictEqual(listB[0].institutionId, 'inst_B');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. CACHING & ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

describe('12. Caching & Analytics Aggregation', () => {
  let service: SubmissionService;
  let cache: SubmissionCache;

  beforeEach(() => { ({ service, cache } = makeService()); });

  test('12.1 Submission is cached after start', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004');
    const cached = cache.getSubmission(submission.submissionId);
    assert.ok(cached);
    assert.strictEqual(cached!.submissionId, submission.submissionId);
  });

  test('12.2 Analytics calculates completion percentage', async () => {
    const { submission } = await service.startSubmission(DEFAULT_START, 'cand_4004'); // totalQuestions = 5
    await service.saveAnswer(submission.submissionId, {
      questionId: 'q_a1', answerType: 'MCQ_SINGLE', answerData: { selectedOptionId: 'opt_1' }
    }, 'cand_4004');
    await service.saveAnswer(submission.submissionId, {
      questionId: 'q_a2', answerType: 'TRUE_FALSE', answerData: { value: false }
    }, 'cand_4004');

    const analytics = await service.getSubmissionAnalytics(submission.submissionId);
    assert.strictEqual(analytics.answeredCount, 2);
    assert.strictEqual(analytics.completionPercentage, 40); // 2 / 5 = 40%
  });
});
