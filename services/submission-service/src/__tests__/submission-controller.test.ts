import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SubmissionController } from '../controllers/SubmissionController';
import { SubmissionService } from '../services/SubmissionService';

describe('SubmissionController Unit Tests', () => {
  const service = new SubmissionService();
  const controller = new SubmissionController(service);

  function mockRes() {
    const res: any = {};
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    res.json = (body: any) => {
      res.body = body;
      return res;
    };
    return res;
  }

  it('startSubmission succeeds and returns 201', async () => {
    const req: any = {
      body: {
        sessionId: 'sess_ctrl_1',
        examId: 'exam_ctrl_1',
        institutionId: 'inst_ctrl_1',
        candidateId: 'cand_ctrl_1',
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com'
      },
      user: { userId: 'cand_ctrl_1' }
    };
    const res = mockRes();
    const next = (err: any) => { throw err; };

    await controller.startSubmission(req, res, next);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.submission.submissionId);
  });

  it('getSubmissionStatus returns status DTO', async () => {
    const startReq: any = {
      body: {
        sessionId: 'sess_ctrl_2',
        examId: 'exam_ctrl_2',
        institutionId: 'inst_ctrl_1',
        candidateId: 'cand_ctrl_2',
        candidateName: 'Jane Smith',
        candidateEmail: 'jane@example.com'
      },
      user: { userId: 'cand_ctrl_2' }
    };
    const resStart = mockRes();
    await controller.startSubmission(startReq, resStart, (err) => { throw err; });
    const subId = resStart.body.data.submission.submissionId;

    const req: any = { params: { submissionId: subId } };
    const res = mockRes();

    await controller.getSubmissionStatus(req, res, (err) => { throw err; });

    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.submissionId, subId);
    assert.strictEqual(res.body.data.status, 'IN_PROGRESS');
  });

  it('reviewSubmission returns validation review', async () => {
    const startReq: any = {
      body: {
        sessionId: 'sess_ctrl_3',
        examId: 'exam_ctrl_3',
        institutionId: 'inst_ctrl_1',
        candidateId: 'cand_ctrl_3',
        candidateName: 'Alice',
        candidateEmail: 'alice@example.com'
      },
      user: { userId: 'cand_ctrl_3' }
    };
    const resStart = mockRes();
    await controller.startSubmission(startReq, resStart, (err) => { throw err; });
    const subId = resStart.body.data.submission.submissionId;

    const req: any = { params: { submissionId: subId }, body: { notes: 'Reviewing' }, user: { userId: 'cand_ctrl_3' } };
    const res = mockRes();

    await controller.reviewSubmission(req, res, (err) => { throw err; });

    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.submissionId, subId);
    assert.ok(res.body.data.validation);
  });
});
