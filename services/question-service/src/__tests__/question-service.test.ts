import assert from 'assert';
import { test, describe, beforeEach } from 'node:test';
import { QuestionCache } from '../cache/QuestionCache';
import { QuestionRepository } from '../db/QuestionRepository';
import { QuestionEventPublisher } from '../events/QuestionEventPublisher';
import { AnalyticsEngine } from '../services/AnalyticsEngine';
import { ImportExportEngine } from '../services/ImportExportEngine';
import { RandomizationEngine } from '../services/RandomizationEngine';
import { QuestionService } from '../services/QuestionService';
import { QuestionAnalyticsEntity, QuestionResponseDto } from '../types/question';

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────

function makeService(): { service: QuestionService; repo: QuestionRepository; cache: QuestionCache } {
  const repo = new QuestionRepository();
  const cache = new QuestionCache(300);
  const service = new QuestionService(repo, cache, new QuestionEventPublisher());
  return { service, repo, cache };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. QUESTION CRUD & VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe('1. Question CRUD & Validation', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('1.1 Create MCQ_SINGLE – persists with options & version 1', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'CS', name: 'CS Bank' }, 'u1');

    const res = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'MCQ_SINGLE',
      title: 'Binary Search Complexity',
      body: 'What is worst-case complexity of binary search?',
      difficulty: 'EASY', marks: 2,
      options: [
        { text: 'O(1)', isCorrect: false },
        { text: 'O(log n)', isCorrect: true },
        { text: 'O(n)', isCorrect: false },
        { text: 'O(n log n)', isCorrect: false }
      ]
    }, 'u1');

    assert.strictEqual(res.question.type, 'MCQ_SINGLE');
    assert.strictEqual(res.question.status, 'DRAFT');
    assert.strictEqual(res.question.version, 1);
    assert.strictEqual(res.options!.length, 4);
    assert.strictEqual(res.versions!.length, 1);
    assert.strictEqual(res.versions![0].changeSummary, 'Initial creation');
  });

  test('1.2 Create MCQ_MULTIPLE – allows multiple correct answers', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Math', name: 'Math Bank' }, 'u1');

    const res = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'MCQ_MULTIPLE',
      title: 'Even numbers', body: 'Which are even?', marks: 3,
      options: [
        { text: '2', isCorrect: true }, { text: '3', isCorrect: false },
        { text: '4', isCorrect: true }, { text: '5', isCorrect: false }
      ]
    }, 'u1');

    assert.strictEqual(res.question.type, 'MCQ_MULTIPLE');
    const correct = res.options!.filter(o => o.isCorrect);
    assert.strictEqual(correct.length, 2);
  });

  test('1.3 Create TRUE_FALSE – enforces exactly 2 options', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Bio', name: 'Bio Bank' }, 'u1');

    await assert.rejects(
      () => service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_a', type: 'TRUE_FALSE',
        title: 'DNA', body: 'DNA carries genetic information.',
        options: [{ text: 'True', isCorrect: true }] // only 1 option
      }, 'u1'),
      /TRUE_FALSE requires at least 2 options/
    );
  });

  test('1.4 Create MATCHING – requires matchingPairs', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Lang', name: 'Lang Bank' }, 'u1');

    const res = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'MATCHING',
      title: 'Match capitals', body: 'Match country to capital.',
      matchingPairs: { France: 'Paris', Germany: 'Berlin', Japan: 'Tokyo' }
    }, 'u1');

    assert.strictEqual(res.question.type, 'MATCHING');
    assert.ok(res.question.matchingPairs);
    assert.strictEqual(Object.keys(res.question.matchingPairs).length, 3);
  });

  test('1.5 Create ORDERING – requires orderingSequence', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Hist', name: 'History Bank' }, 'u1');

    const res = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'ORDERING',
      title: 'Order events', body: 'Arrange in chronological order.',
      orderingSequence: ['WWI', 'WWII', 'Cold War', 'Moon Landing']
    }, 'u1');

    assert.strictEqual(res.question.type, 'ORDERING');
    assert.deepStrictEqual(res.question.orderingSequence, ['WWI', 'WWII', 'Cold War', 'Moon Landing']);
  });

  test('1.6 Create NUMERICAL – requires tolerance or variations', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Physics', name: 'Physics Bank' }, 'u1');

    const res = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'NUMERICAL',
      title: 'Speed of Light', body: 'Approx speed of light in m/s?',
      numericalTolerance: 0.01, acceptedVariations: ['3e8', '3×10^8', '299792458']
    }, 'u1');

    assert.strictEqual(res.question.type, 'NUMERICAL');
    assert.strictEqual(res.question.numericalTolerance, 0.01);
  });

  test('1.7 Create CODE_SNIPPET – requires codeLanguage', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Prog', name: 'Prog Bank' }, 'u1');

    await assert.rejects(
      () => service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_a', type: 'CODE_SNIPPET',
        title: 'FizzBuzz', body: 'Implement FizzBuzz.'
        // missing codeLanguage
      }, 'u1'),
      /CODE_SNIPPET type requires codeLanguage/
    );
  });

  test('1.8 Reject negative marks', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'CS', name: 'B' }, 'u1');
    await assert.rejects(
      () => service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
        title: 'Test', body: 'Body', marks: -5
      }, 'u1'),
      /marks cannot be negative/
    );
  });

  test('1.9 Update question – increments version', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'CS', name: 'B2' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
      title: 'Planck Constant', body: 'What is Planck constant?'
    }, 'u1');

    const updated = await service.updateQuestion(q.question.questionId, {
      body: 'What is the exact value of Planck constant in J·s?',
      changeSummary: 'Clarified units'
    }, 'u1');

    assert.strictEqual(updated.question.version, 2);
    assert.strictEqual(updated.versions!.length, 2);
    assert.strictEqual(updated.versions![1].changeSummary, 'Clarified units');
  });

  test('1.10 Delete question – removes from repository', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'CS', name: 'B3' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
      title: 'Delete Me', body: 'To be deleted.'
    }, 'u1');

    await service.deleteQuestion(q.question.questionId, 'u1');

    await assert.rejects(
      () => service.getQuestion(q.question.questionId),
      /QUESTION_NOT_FOUND/
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. DUPLICATE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

describe('2. Duplicate Detection', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('2.1 Reject identical title+body within same institution', async () => {
    const bank = await service.createBank({ institutionId: 'inst_dup', subject: 'CS', name: 'Dup Bank' }, 'u1');

    await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_dup', type: 'SHORT_ANSWER',
      title: 'Capital of France', body: 'What is the capital of France?'
    }, 'u1');

    await assert.rejects(
      () => service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_dup', type: 'SHORT_ANSWER',
        title: 'Capital of France', body: 'What is the capital of France?'
      }, 'u1'),
      /QUESTION_DUPLICATE/
    );
  });

  test('2.2 Allow same content in different institutions', async () => {
    const b1 = await service.createBank({ institutionId: 'inst_1', subject: 'CS', name: 'B1' }, 'u1');
    const b2 = await service.createBank({ institutionId: 'inst_2', subject: 'CS', name: 'B2' }, 'u1');

    await service.createQuestion({
      bankId: b1.bankId, institutionId: 'inst_1', type: 'SHORT_ANSWER',
      title: 'Unique Title', body: 'Unique body.'
    }, 'u1');

    // Should NOT throw – different institution
    const q2 = await service.createQuestion({
      bankId: b2.bankId, institutionId: 'inst_2', type: 'SHORT_ANSWER',
      title: 'Unique Title', body: 'Unique body.'
    }, 'u1');

    assert.ok(q2.question.questionId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. APPROVAL WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

describe('3. Approval Workflow', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('3.1 Full approval lifecycle: DRAFT → PENDING_REVIEW → APPROVED', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Chem', name: 'Chemistry' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'TRUE_FALSE',
      title: 'Benzene', body: 'Benzene is aromatic.',
      options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }]
    }, 'u1');

    assert.strictEqual(q.question.status, 'DRAFT');

    const pending = await service.updateApprovalStatus(q.question.questionId, 'PENDING_REVIEW', 'u1');
    assert.strictEqual(pending.question.status, 'PENDING_REVIEW');

    const approved = await service.updateApprovalStatus(q.question.questionId, 'APPROVED', 'reviewer1');
    assert.strictEqual(approved.question.status, 'APPROVED');
    assert.strictEqual(approved.question.approvedById, 'reviewer1');
    assert.ok(approved.question.approvedAt);
  });

  test('3.2 REJECTED stores rejectionReason', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'CS', name: 'B' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
      title: 'Bad Question', body: 'Bad body.'
    }, 'u1');

    const rejected = await service.updateApprovalStatus(
      q.question.questionId, 'REJECTED', 'reviewer1', 'Question is ambiguous'
    );
    assert.strictEqual(rejected.question.status, 'REJECTED');
    assert.strictEqual(rejected.question.rejectionReason, 'Question is ambiguous');
  });

  test('3.3 Archive sets status to ARCHIVED', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Phys', name: 'Physics' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
      title: 'Old Question', body: 'Outdated.'
    }, 'u1');

    const archived = await service.updateApprovalStatus(q.question.questionId, 'ARCHIVED', 'admin');
    assert.strictEqual(archived.question.status, 'ARCHIVED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. VERSION HISTORY & RESTORE
// ─────────────────────────────────────────────────────────────────────────────

describe('4. Version History & Restore', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('4.1 Version history grows with each update', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Bio', name: 'Bio' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
      title: 'DNA Structure', body: 'Describe DNA structure.'
    }, 'u1');

    await service.updateQuestion(q.question.questionId, { body: 'v2 body' }, 'u1');
    await service.updateQuestion(q.question.questionId, { body: 'v3 body' }, 'u1');

    const versions = await service.getVersionHistory(q.question.questionId);
    assert.strictEqual(versions.length, 3);
    assert.strictEqual(versions[0].version, 1);
    assert.strictEqual(versions[2].version, 3);
  });

  test('4.2 Restore to earlier version changes body', async () => {
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'Sci', name: 'Sci' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
      title: 'Photosynthesis', body: 'Original body v1'
    }, 'u1');

    await service.updateQuestion(q.question.questionId, { body: 'Modified body v2' }, 'u1');
    assert.strictEqual((await service.getQuestion(q.question.questionId)).question.body, 'Modified body v2');

    await service.restoreVersion({ questionId: q.question.questionId, targetVersion: 1, actorUserId: 'u1' });
    const restored = await service.getQuestion(q.question.questionId);
    assert.strictEqual(restored.question.body, 'Original body v1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. QUESTION BANKS
// ─────────────────────────────────────────────────────────────────────────────

describe('5. Question Banks', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('5.1 Create, get, list, update, archive', async () => {
    const bank = await service.createBank({
      institutionId: 'inst_x', subject: 'Math', name: 'Algebra',
      description: 'Algebra questions'
    }, 'u1');

    assert.ok(bank.bankId);
    assert.strictEqual(bank.isArchived, false);
    assert.strictEqual(bank.questionCount, 0);

    const fetched = await service.getBank(bank.bankId);
    assert.strictEqual(fetched.bankId, bank.bankId);

    const updated = await service.updateBank(bank.bankId, { name: 'Advanced Algebra' }, 'u1');
    assert.strictEqual(updated.name, 'Advanced Algebra');
    assert.strictEqual(updated.version, 2);

    const banks = await service.listBanks('inst_x');
    assert.strictEqual(banks.length, 1);

    const archived = await service.archiveBank(bank.bankId, 'u1');
    assert.strictEqual(archived.isArchived, true);

    const activeBanks = await service.listBanks('inst_x');
    assert.strictEqual(activeBanks.length, 0); // archived excluded by default

    const allBanks = await service.listBanks('inst_x', true);
    assert.strictEqual(allBanks.length, 1);
  });

  test('5.2 Clone bank duplicates all questions', async () => {
    const bank = await service.createBank({ institutionId: 'inst_x', subject: 'CS', name: 'Source Bank' }, 'u1');

    for (let i = 1; i <= 3; i++) {
      await service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_x', type: 'SHORT_ANSWER',
        title: `Question ${i}`, body: `Body of question ${i}`
      }, 'u1');
    }

    const cloned = await service.cloneBank(bank.bankId, 'Cloned Bank', 'u1');
    assert.ok(cloned.bankId !== bank.bankId);
    assert.strictEqual(cloned.name, 'Cloned Bank');

    const clonedQuestions = await service.searchQuestions({ bankId: cloned.bankId, limit: 100 });
    assert.strictEqual(clonedQuestions.items.length, 3);
  });

  test('5.3 Bank question count increments on question creation', async () => {
    const bank = await service.createBank({ institutionId: 'inst_x', subject: 'CS', name: 'Count Bank' }, 'u1');
    assert.strictEqual(bank.questionCount, 0);

    await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_x', type: 'SHORT_ANSWER',
      title: 'Q1', body: 'Body 1'
    }, 'u1');

    const fetched = await service.getBank(bank.bankId);
    assert.strictEqual(fetched.questionCount, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. QUESTION POOLS
// ─────────────────────────────────────────────────────────────────────────────

describe('6. Question Pools', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('6.1 Create and get pool', async () => {
    const bank = await service.createBank({ institutionId: 'inst_p', subject: 'CS', name: 'B' }, 'u1');
    const pool = await service.createPool({
      bankId: bank.bankId, institutionId: 'inst_p', name: 'Easy Set',
      strategy: 'RANDOM', targetQuestionCount: 5,
      difficultyDistribution: { EASY: 3, MEDIUM: 2, HARD: 0 }
    });

    assert.ok(pool.poolId);
    assert.strictEqual(pool.strategy, 'RANDOM');
    assert.strictEqual(pool.targetQuestionCount, 5);
    assert.strictEqual(pool.isValidated, false);

    const fetched = await service.getPool(pool.poolId);
    assert.strictEqual(fetched.poolId, pool.poolId);
  });

  test('6.2 Update pool resets isValidated', async () => {
    const bank = await service.createBank({ institutionId: 'inst_p', subject: 'CS', name: 'B' }, 'u1');
    const pool = await service.createPool({
      bankId: bank.bankId, institutionId: 'inst_p', name: 'Test Pool',
      targetQuestionCount: 10
    });

    const updated = await service.updatePool(pool.poolId, { name: 'Updated Pool', targetQuestionCount: 15 });
    assert.strictEqual(updated.name, 'Updated Pool');
    assert.strictEqual(updated.targetQuestionCount, 15);
    assert.strictEqual(updated.isValidated, false);
  });

  test('6.3 Validate pool – detects insufficient questions', async () => {
    const bank = await service.createBank({ institutionId: 'inst_p', subject: 'CS', name: 'Val Bank' }, 'u1');
    const pool = await service.createPool({
      bankId: bank.bankId, institutionId: 'inst_p', name: 'Oversized Pool',
      targetQuestionCount: 100 // way more than available
    });

    const result = await service.validatePool(pool.poolId);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].includes('100'));
  });

  test('6.4 Validate pool – succeeds when enough APPROVED questions exist', async () => {
    const bank = await service.createBank({ institutionId: 'inst_p', subject: 'CS', name: 'Full Bank' }, 'u1');

    for (let i = 1; i <= 5; i++) {
      const q = await service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_p', type: 'SHORT_ANSWER',
        title: `Question ${i}`, body: `Body ${i}`
      }, 'u1');
      await service.updateApprovalStatus(q.question.questionId, 'APPROVED', 'reviewer');
    }

    const pool = await service.createPool({
      bankId: bank.bankId, institutionId: 'inst_p', name: 'Valid Pool',
      targetQuestionCount: 3
    });

    const result = await service.validatePool(pool.poolId);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('6.5 List and delete pool', async () => {
    const bank = await service.createBank({ institutionId: 'inst_p', subject: 'CS', name: 'B3' }, 'u1');
    const p1 = await service.createPool({ bankId: bank.bankId, institutionId: 'inst_p', name: 'P1', targetQuestionCount: 5 });
    const p2 = await service.createPool({ bankId: bank.bankId, institutionId: 'inst_p', name: 'P2', targetQuestionCount: 5 });

    const pools = await service.listPools(bank.bankId);
    assert.strictEqual(pools.length, 2);

    await service.deletePool(p1.poolId);
    const remaining = await service.listPools(bank.bankId);
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining[0].poolId, p2.poolId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. RANDOMIZATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

describe('7. Randomization Engine', () => {
  let engine: RandomizationEngine;

  beforeEach(() => { engine = new RandomizationEngine(); });

  test('7.1 Seeded shuffle is deterministic', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const run1 = engine.shuffle([...items], 'seed_abc');
    const run2 = engine.shuffle([...items], 'seed_abc');
    assert.deepStrictEqual(run1, run2);
  });

  test('7.2 Different seeds produce different orders', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const r1 = engine.shuffle([...items], 'seed_1');
    const r2 = engine.shuffle([...items], 'seed_2');
    assert.notDeepStrictEqual(r1, r2);
  });

  test('7.3 getRandomizedQuestions returns correct count with seed', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_r', subject: 'Math', name: 'Calculus' }, 'u1');

    for (let i = 1; i <= 8; i++) {
      const q = await service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_r', type: 'SHORT_ANSWER',
        title: `Math Q ${i}`, body: `Body ${i}`,
        difficulty: i <= 3 ? 'EASY' : i <= 6 ? 'MEDIUM' : 'HARD'
      }, 'u1');
      await service.updateApprovalStatus(q.question.questionId, 'APPROVED', 'r1');
    }

    const run1 = await service.getRandomizedQuestions({ bankId: bank.bankId, count: 4, seed: 'seed_42' });
    const run2 = await service.getRandomizedQuestions({ bankId: bank.bankId, count: 4, seed: 'seed_42' });

    assert.strictEqual(run1.length, 4);
    assert.strictEqual(run1[0].question.questionId, run2[0].question.questionId);
    assert.strictEqual(run1[3].question.questionId, run2[3].question.questionId);
  });

  test('7.4 balanceDifficulty – respects distribution', () => {
    const questions = [
      ...Array.from({ length: 5 }, (_, i) => ({ difficulty: 'EASY' as const, id: `e${i}` })),
      ...Array.from({ length: 5 }, (_, i) => ({ difficulty: 'MEDIUM' as const, id: `m${i}` })),
      ...Array.from({ length: 5 }, (_, i) => ({ difficulty: 'HARD' as const, id: `h${i}` }))
    ];

    const selected = engine.balanceDifficulty(questions, 6, { EASY: 2, MEDIUM: 2, HARD: 2 }, 'seed_x');
    assert.strictEqual(selected.length, 6);
    assert.strictEqual(selected.filter(q => q.difficulty === 'EASY').length, 2);
    assert.strictEqual(selected.filter(q => q.difficulty === 'MEDIUM').length, 2);
    assert.strictEqual(selected.filter(q => q.difficulty === 'HARD').length, 2);
  });

  test('7.5 Option order randomization with seed is consistent', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_r', subject: 'CS', name: 'Rand Bank' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_r', type: 'MCQ_SINGLE',
      title: 'Opt Order', body: 'Pick the right option.',
      difficulty: 'EASY',
      options: [
        { text: 'A', isCorrect: true }, { text: 'B', isCorrect: false },
        { text: 'C', isCorrect: false }, { text: 'D', isCorrect: false }
      ]
    }, 'u1');
    await service.updateApprovalStatus(q.question.questionId, 'APPROVED', 'r1');

    const r1 = await service.getRandomizedQuestions({ bankId: bank.bankId, count: 1, seed: 'opt_seed', randomizeOptions: true });
    const r2 = await service.getRandomizedQuestions({ bankId: bank.bankId, count: 1, seed: 'opt_seed', randomizeOptions: true });

    assert.deepStrictEqual(r1[0].options!.map(o => o.text), r2[0].options!.map(o => o.text));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. IMPORT / EXPORT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

describe('8. Import / Export Engine', () => {
  let engine: ImportExportEngine;

  beforeEach(() => { engine = new ImportExportEngine(); });

  test('8.1 Parse JSON import', () => {
    const json = JSON.stringify([
      { type: 'MCQ_SINGLE', title: 'Q1', body: 'Body1', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }] },
      { type: 'SHORT_ANSWER', title: 'Q2', body: 'Body2' }
    ]);

    const { dtos, report } = engine.parseImportPayload(json, 'JSON');
    assert.strictEqual(dtos.length, 2);
    assert.strictEqual(dtos[0].type, 'MCQ_SINGLE');
    assert.strictEqual(report.length, 2);
    assert.strictEqual(report[0].status, 'IMPORTED');
  });

  test('8.2 Detect intra-batch duplicates in JSON', () => {
    const json = JSON.stringify([
      { title: 'Same Title', body: 'Same Body' },
      { title: 'Same Title', body: 'Same Body' } // duplicate
    ]);
    const { report, duplicateHashes } = engine.parseImportPayload(json, 'JSON');
    assert.strictEqual(duplicateHashes.size, 1);
    assert.strictEqual(report[1].status, 'SKIPPED_DUPLICATE');
  });

  test('8.3 Parse CSV import', () => {
    const csv = [
      'title,body,type,difficulty,marks,negative_marks,estimated_time_seconds,options',
      '"Speed of Light","What is speed of light?",MCQ_SINGLE,EASY,1,0,60,"*3x10^8 m/s|1500 m/s"'
    ].join('\n');

    const { dtos } = engine.parseImportPayload(csv, 'CSV');
    assert.strictEqual(dtos.length, 1);
    assert.strictEqual(dtos[0].title, 'Speed of Light');
    assert.strictEqual(dtos[0].options![0].isCorrect, true);
    assert.strictEqual(dtos[0].options![1].isCorrect, false);
  });

  test('8.4 Parse Markdown import', () => {
    const md = [
      '### Capital of France',
      '',
      'What is the capital of France?',
      '',
      '- [x] Paris',
      '- [ ] London',
      '- [ ] Berlin'
    ].join('\n');

    const { dtos } = engine.parseImportPayload(md, 'MARKDOWN');
    assert.strictEqual(dtos.length, 1);
    assert.strictEqual(dtos[0].title, 'Capital of France');
    assert.strictEqual(dtos[0].type, 'MCQ_SINGLE');
    assert.strictEqual(dtos[0].options!.find(o => o.text === 'Paris')!.isCorrect, true);
  });

  test('8.5 Export JSON round-trip', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_e', subject: 'CS', name: 'Export Bank' }, 'u1');
    await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_e', type: 'SHORT_ANSWER',
      title: 'Export Test', body: 'This will be exported.'
    }, 'u1');

    const { content } = await service.exportQuestions(bank.bankId, 'inst_e', 'JSON', 'u1');
    const parsed = JSON.parse(content);
    assert.ok(Array.isArray(parsed));
    assert.strictEqual(parsed[0].question.title, 'Export Test');
  });

  test('8.6 Export Markdown contains question title', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_e', subject: 'Bio', name: 'Md Bank' }, 'u1');
    await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_e', type: 'SHORT_ANSWER',
      title: 'Mitosis Definition', body: 'What is mitosis?'
    }, 'u1');

    const { content } = await service.exportQuestions(bank.bankId, 'inst_e', 'MARKDOWN', 'u1');
    assert.ok(content.includes('Mitosis Definition'));
    assert.ok(content.includes('What is mitosis?'));
  });

  test('8.7 Export CSV contains headers and data', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_e', subject: 'Physics', name: 'CSV Bank' }, 'u1');
    await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_e', type: 'SHORT_ANSWER',
      title: 'Gravity', body: 'What is 9.8 m/s²?'
    }, 'u1');

    const { content } = await service.exportQuestions(bank.bankId, 'inst_e', 'CSV', 'u1');
    assert.ok(content.startsWith('question_id'));
    assert.ok(content.includes('Gravity'));
  });

  test('8.8 Import template generation – JSON', () => {
    const tmpl = engine.generateTemplate('JSON');
    assert.strictEqual(tmpl.format, 'JSON');
    const parsed = JSON.parse(tmpl.templateContent);
    assert.ok(Array.isArray(parsed));
    assert.ok(parsed[0].title);
  });

  test('8.9 Import template generation – CSV', () => {
    const tmpl = engine.generateTemplate('CSV');
    assert.ok(tmpl.templateContent.startsWith('title,body'));
  });

  test('8.10 Bulk import + cross-batch duplicate detection', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_i', subject: 'Gen', name: 'Import Bank' }, 'u1');

    const json1 = JSON.stringify([
      { title: 'Existing Q', body: 'Pre-existing body.', type: 'SHORT_ANSWER' }
    ]);
    const job1 = await service.importQuestions(bank.bankId, 'inst_i', json1, 'JSON', 'u1');
    assert.strictEqual(job1.importedCount, 1);

    // Second import with same question
    const json2 = JSON.stringify([
      { title: 'Existing Q', body: 'Pre-existing body.', type: 'SHORT_ANSWER' }, // cross-batch dup
      { title: 'New Q', body: 'New body.', type: 'SHORT_ANSWER' }
    ]);
    const job2 = await service.importQuestions(bank.bankId, 'inst_i', json2, 'JSON', 'u1');
    assert.strictEqual(job2.importedCount, 1);
    assert.strictEqual(job2.duplicateCount, 1);
    assert.strictEqual(job2.status, 'COMPLETED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. ANALYTICS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

describe('9. Analytics Engine', () => {
  let engine: AnalyticsEngine;

  beforeEach(() => { engine = new AnalyticsEngine(); });

  test('9.1 First attempt creates analytics entity', () => {
    const result = engine.applyAttempt(
      { questionId: 'q1', institutionId: 'inst_a', isCorrect: true, responseTimeSeconds: 30 },
      null
    );

    assert.strictEqual(result.questionId, 'q1');
    assert.strictEqual(result.totalAttempts, 1);
    assert.strictEqual(result.correctAttempts, 1);
    assert.strictEqual(result.incorrectAttempts, 0);
    assert.strictEqual(result.difficultyIndex, 1.0); // 1/1
  });

  test('9.2 Difficulty index converges over multiple attempts', () => {
    let entity: QuestionAnalyticsEntity | null = null;
    for (let i = 0; i < 10; i++) {
      entity = engine.applyAttempt(
        { questionId: 'q2', institutionId: 'inst_a', isCorrect: i < 7, responseTimeSeconds: 20 },
        entity
      );
    }

    assert.ok(entity!.totalAttempts === 10);
    // 7 correct out of 10 → p-value ≈ 0.7
    assert.ok(Math.abs(entity!.difficultyIndex - 0.7) < 0.01);
  });

  test('9.3 recordAttempt via service updates analytics', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'CS', name: 'A Bank' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
      title: 'Analytics Q', body: 'Body for analytics.'
    }, 'u1');

    await service.recordAttempt({ questionId: q.question.questionId, institutionId: 'inst_a', isCorrect: true, responseTimeSeconds: 45 });
    await service.recordAttempt({ questionId: q.question.questionId, institutionId: 'inst_a', isCorrect: false, responseTimeSeconds: 60 });

    const analytics = await service.getAnalytics(q.question.questionId);
    assert.ok(analytics);
    assert.strictEqual(analytics.totalAttempts, 2);
    assert.strictEqual(analytics.correctAttempts, 1);
    assert.strictEqual(analytics.incorrectAttempts, 1);
    assert.ok(Math.abs(analytics.difficultyIndex - 0.5) < 0.01);
  });

  test('9.4 Bank analytics summary aggregates all questions', async () => {
    const { service } = makeService();
    const bank = await service.createBank({ institutionId: 'inst_a', subject: 'CS', name: 'Summary Bank' }, 'u1');

    for (let i = 1; i <= 3; i++) {
      const q = await service.createQuestion({
        bankId: bank.bankId, institutionId: 'inst_a', type: 'SHORT_ANSWER',
        title: `Agg Q ${i}`, body: `Body ${i}`
      }, 'u1');
      await service.recordAttempt({ questionId: q.question.questionId, institutionId: 'inst_a', isCorrect: true, responseTimeSeconds: 30 * i });
    }

    const summary = await service.getBankAnalyticsSummary(bank.bankId, 'inst_a');
    assert.strictEqual(summary.questionCount, 3);
    assert.strictEqual(summary.totalAttempts, 3);
    assert.ok(summary.avgDifficultyIndex > 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. CATEGORIES & TAGS
// ─────────────────────────────────────────────────────────────────────────────

describe('10. Categories & Tags', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('10.1 Create, list, delete category', async () => {
    const cat = await service.createCategory({ institutionId: 'inst_c', name: 'Algorithms', description: 'CS Algorithms' });
    assert.ok(cat.categoryId);
    assert.strictEqual(cat.name, 'Algorithms');

    const cats = await service.listCategories('inst_c');
    assert.strictEqual(cats.length, 1);

    await service.deleteCategory(cat.categoryId, 'inst_c');
    const empty = await service.listCategories('inst_c');
    assert.strictEqual(empty.length, 0);
  });

  test('10.2 Category parentId for hierarchy', async () => {
    const parent = await service.createCategory({ institutionId: 'inst_c', name: 'Science' });
    const child = await service.createCategory({
      institutionId: 'inst_c', name: 'Biology', parentId: parent.categoryId
    });

    assert.strictEqual(child.parentId, parent.categoryId);
    const cats = await service.listCategories('inst_c');
    assert.strictEqual(cats.length, 2);
  });

  test('10.3 Create, list, delete tag', async () => {
    const tag = await service.createTag({ institutionId: 'inst_t', name: 'Recursion' });
    assert.ok(tag.tagId);
    assert.strictEqual(tag.name, 'recursion'); // normalized to lowercase

    const tags = await service.listTags('inst_t');
    assert.strictEqual(tags.length, 1);

    await service.deleteTag(tag.tagId, 'inst_t');
    const empty = await service.listTags('inst_t');
    assert.strictEqual(empty.length, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. TENANT ISOLATION
// ─────────────────────────────────────────────────────────────────────────────

describe('11. Tenant Isolation', () => {
  let service: QuestionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('11.1 Questions from inst_A are not visible in inst_B search', async () => {
    const bankA = await service.createBank({ institutionId: 'inst_A', subject: 'CS', name: 'Bank A' }, 'u1');
    const bankB = await service.createBank({ institutionId: 'inst_B', subject: 'CS', name: 'Bank B' }, 'u1');

    await service.createQuestion({
      bankId: bankA.bankId, institutionId: 'inst_A', type: 'SHORT_ANSWER',
      title: 'A Question', body: 'For institution A.'
    }, 'u1');
    await service.createQuestion({
      bankId: bankB.bankId, institutionId: 'inst_B', type: 'SHORT_ANSWER',
      title: 'B Question', body: 'For institution B.'
    }, 'u1');

    const resultsA = await service.searchQuestions({ institutionId: 'inst_A' });
    const resultsB = await service.searchQuestions({ institutionId: 'inst_B' });

    assert.strictEqual(resultsA.items.length, 1);
    assert.strictEqual(resultsA.items[0].question.title, 'A Question');
    assert.strictEqual(resultsB.items.length, 1);
    assert.strictEqual(resultsB.items[0].question.title, 'B Question');
  });

  test('11.2 Banks from inst_A are not listed for inst_B', async () => {
    await service.createBank({ institutionId: 'inst_A', subject: 'CS', name: 'A Bank' }, 'u1');
    await service.createBank({ institutionId: 'inst_B', subject: 'CS', name: 'B Bank' }, 'u1');

    const banksA = await service.listBanks('inst_A');
    const banksB = await service.listBanks('inst_B');

    assert.strictEqual(banksA.length, 1);
    assert.strictEqual(banksA[0].name, 'A Bank');
    assert.strictEqual(banksB.length, 1);
    assert.strictEqual(banksB[0].name, 'B Bank');
  });

  test('11.3 Duplicate detection is institution-scoped', async () => {
    const bankA = await service.createBank({ institutionId: 'inst_A', subject: 'CS', name: 'A' }, 'u1');
    const bankB = await service.createBank({ institutionId: 'inst_B', subject: 'CS', name: 'B' }, 'u1');

    await service.createQuestion({
      bankId: bankA.bankId, institutionId: 'inst_A', type: 'SHORT_ANSWER',
      title: 'Shared Title', body: 'Shared Body'
    }, 'u1');

    // Should NOT throw — different institution
    const qB = await service.createQuestion({
      bankId: bankB.bankId, institutionId: 'inst_B', type: 'SHORT_ANSWER',
      title: 'Shared Title', body: 'Shared Body'
    }, 'u1');
    assert.ok(qB.question.questionId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. CACHING
// ─────────────────────────────────────────────────────────────────────────────

describe('12. Caching', () => {
  let cache: QuestionCache;
  let service: QuestionService;
  let repo: QuestionRepository;

  beforeEach(() => {
    ({ service, repo, cache } = makeService());
  });

  test('12.1 Question is cached after first retrieval', async () => {
    const bank = await service.createBank({ institutionId: 'inst_c', subject: 'CS', name: 'Cache Bank' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_c', type: 'SHORT_ANSWER',
      title: 'Cache Test', body: 'Will be cached.'
    }, 'u1');

    // First fetch (populates cache)
    await service.getQuestion(q.question.questionId);
    assert.ok(cache.getQuestion(q.question.questionId) !== null, 'Should be in cache after first get');
  });

  test('12.2 Cache reflects updated content after updateQuestion', async () => {
    const bank = await service.createBank({ institutionId: 'inst_c', subject: 'CS', name: 'Inv Bank' }, 'u1');
    const q = await service.createQuestion({
      bankId: bank.bankId, institutionId: 'inst_c', type: 'SHORT_ANSWER',
      title: 'Invalidate Test', body: 'Will be updated.'
    }, 'u1');

    // First fetch – populate cache
    await service.getQuestion(q.question.questionId);
    assert.ok(cache.getQuestion(q.question.questionId) !== null);

    // Update – service clears cache then repopulates it via getQuestion at the end
    await service.updateQuestion(q.question.questionId, { body: 'Updated body' }, 'u1');

    // Cache should now contain the updated body
    const cached = cache.getQuestion(q.question.questionId);
    assert.ok(cached !== null, 'Cache should be repopulated after update');
    assert.strictEqual(cached!.question.body, 'Updated body', 'Cache should contain updated body');
    assert.strictEqual(cached!.question.version, 2);
  });

  test('12.3 Bank list cache invalidated after new bank created', async () => {
    await service.createBank({ institutionId: 'inst_cl', subject: 'CS', name: 'First Bank' }, 'u1');
    await service.listBanks('inst_cl');
    assert.ok(cache.getBankList('inst_cl') !== null, 'Bank list should be cached');

    await service.createBank({ institutionId: 'inst_cl', subject: 'Math', name: 'Second Bank' }, 'u1');
    assert.strictEqual(cache.getBankList('inst_cl'), null, 'Bank list cache should be cleared after new bank');
  });
});
