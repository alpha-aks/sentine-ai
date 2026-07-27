import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SubmissionRepository } from '../db/SubmissionRepository';

describe('SubmissionRepository Unit Tests', () => {
  const repository = new SubmissionRepository();

  it('creates and finds submission by ID and Session ID', async () => {
    const subId = repository.generateId('sub');
    const entity: any = {
      submissionId: subId,
      sessionId: 'sess_repo_1',
      examId: 'exam_repo_1',
      institutionId: 'inst_repo_1',
      candidateId: 'cand_repo_1',
      candidateName: 'Test Candidate',
      candidateEmail: 'cand@test.com',
      status: 'IN_PROGRESS',
      isLocked: false,
      totalAnswers: 5,
      answeredCount: 0,
      flaggedCount: 0,
      startedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
      version: 1,
      metaData: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await repository.createSubmission(entity);

    const byId = await repository.findSubmissionById(subId);
    assert.ok(byId);
    assert.strictEqual(byId?.sessionId, 'sess_repo_1');

    const bySession = await repository.findSubmissionBySessionId('sess_repo_1');
    assert.ok(bySession);
    assert.strictEqual(bySession?.submissionId, subId);
  });

  it('saves answer and updates submission answered count', async () => {
    const subId = repository.generateId('sub');
    await repository.createSubmission({
      submissionId: subId,
      sessionId: 'sess_repo_2',
      examId: 'exam_repo_2',
      institutionId: 'inst_repo_1',
      candidateId: 'cand_repo_2',
      candidateName: 'Test 2',
      candidateEmail: 'test2@test.com',
      status: 'IN_PROGRESS',
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
      lockReason: null,
      totalAnswers: 2,
      answeredCount: 0,
      flaggedCount: 0,
      startedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
      submittedAt: null,
      submittedBy: null,
      version: 1,
      metaData: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const answer: any = {
      answerId: repository.generateId('ans'),
      submissionId: subId,
      questionId: 'q_repo_1',
      candidateId: 'cand_repo_2',
      answerType: 'MCQ_SINGLE',
      answerData: { selectedOptionId: 'opt_1' },
      isDraft: false,
      isFlagged: false,
      version: 1,
      lastSavedAt: new Date().toISOString(),
      lastSaveSource: 'MANUAL'
    };

    await repository.saveAnswer(answer);

    const saved = await repository.findAnswer(subId, 'q_repo_1');
    assert.ok(saved);
    assert.strictEqual(saved?.answerType, 'MCQ_SINGLE');

    const sub = await repository.findSubmissionById(subId);
    assert.strictEqual(sub?.answeredCount, 1);
  });

  it('appends and retrieves events and history', async () => {
    const subId = repository.generateId('sub');
    await repository.appendEvent({
      eventId: repository.generateId('evt'),
      submissionId: subId,
      eventType: 'SubmissionStarted',
      payload: { test: true },
      timestamp: new Date().toISOString()
    });

    const events = await repository.getEvents(subId);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].eventType, 'SubmissionStarted');
  });
});
