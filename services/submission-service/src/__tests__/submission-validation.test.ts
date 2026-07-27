import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { SubmissionValidationEngine } from '../services/SubmissionValidationEngine';
import { getSubmissionServiceConfig } from '../config/submission-config';

describe('SubmissionValidationEngine Unit Tests', () => {
  const repository = new SubmissionRepository();
  const config = getSubmissionServiceConfig();
  const validator = new SubmissionValidationEngine(repository, config);

  it('validates answer data for all 10 question types', () => {
    // 1. MCQ_SINGLE
    assert.doesNotThrow(() => validator.validateAnswerData('MCQ_SINGLE', { selectedOptionId: 'opt_1' }));
    assert.throws(() => validator.validateAnswerData('MCQ_SINGLE', { selectedOptionId: 123 }));

    // 2. MCQ_MULTIPLE
    assert.doesNotThrow(() => validator.validateAnswerData('MCQ_MULTIPLE', { selectedOptionIds: ['opt_1', 'opt_2'] }));
    assert.throws(() => validator.validateAnswerData('MCQ_MULTIPLE', { selectedOptionIds: 'opt_1' }));

    // 3. TRUE_FALSE
    assert.doesNotThrow(() => validator.validateAnswerData('TRUE_FALSE', { value: true }));
    assert.throws(() => validator.validateAnswerData('TRUE_FALSE', { value: 'true' }));

    // 4. SHORT_ANSWER / LONG_ANSWER / FILL_BLANK
    assert.doesNotThrow(() => validator.validateAnswerData('SHORT_ANSWER', { text: 'Hello' }));
    assert.doesNotThrow(() => validator.validateAnswerData('LONG_ANSWER', { text: 'Paragraph' }));
    assert.doesNotThrow(() => validator.validateAnswerData('FILL_BLANK', { text: 'blank_val' }));
    assert.throws(() => validator.validateAnswerData('SHORT_ANSWER', { text: 123 }));

    // 5. NUMERICAL
    assert.doesNotThrow(() => validator.validateAnswerData('NUMERICAL', { value: 42.5 }));
    assert.throws(() => validator.validateAnswerData('NUMERICAL', { value: '42.5' }));

    // 6. CODE / PROGRAMMING / CODE_SNIPPET
    assert.doesNotThrow(() => validator.validateAnswerData('CODE', { code: 'console.log(1);', language: 'javascript' }));
    assert.doesNotThrow(() => validator.validateAnswerData('PROGRAMMING', { code: 'print(1)', language: 'python' }));
    assert.doesNotThrow(() => validator.validateAnswerData('CODE_SNIPPET', { code: 'int x = 0;', language: 'cpp' }));

    // 7. FILE_UPLOAD
    assert.doesNotThrow(() => validator.validateAnswerData('FILE_UPLOAD', { fileIds: ['file_1'] }));

    // 8. MATCHING
    assert.doesNotThrow(() => validator.validateAnswerData('MATCHING', { pairs: [{ leftId: 'l1', rightId: 'r1' }] }));

    // 9. ORDERING
    assert.doesNotThrow(() => validator.validateAnswerData('ORDERING', { orderedIds: ['item_1', 'item_2'] }));
  });

  it('asserts modifiable check correctly', () => {
    const activeSub: any = { submissionId: 's1', status: 'IN_PROGRESS', isLocked: false };
    const lockedSub: any = { submissionId: 's2', status: 'IN_PROGRESS', isLocked: true };
    const submittedSub: any = { submissionId: 's3', status: 'SUBMITTED', isLocked: false };

    assert.doesNotThrow(() => validator.assertModifiable(activeSub));
    assert.throws(() => validator.assertModifiable(lockedSub), /SUBMISSION_LOCKED/);
    assert.throws(() => validator.assertModifiable(submittedSub), /SUBMISSION_ALREADY_FINALIZED/);
  });

  it('asserts exam deadline expiration correctly', () => {
    const sub: any = { submissionId: 's1' };
    const pastTime = new Date(Date.now() - 10000).toISOString();
    const futureTime = new Date(Date.now() + 100000).toISOString();

    assert.doesNotThrow(() => validator.assertExamNotExpired(sub, futureTime));
    assert.throws(() => validator.assertExamNotExpired(sub, pastTime), /EXAM_DEADLINE_EXPIRED/);
  });
});
