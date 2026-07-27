import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MonitoringService } from '../services/monitoring.service';
import { MonitoringStore } from '../db/monitoring-store';

describe('Proctor Monitoring Backend Manual Checklist & Edge Cases', () => {
  let service: MonitoringService;
  let store: MonitoringStore;

  beforeEach(() => {
    store = MonitoringStore.getInstance();
    store.clear();
    service = new MonitoringService();
  });

  describe('1. Live Monitoring APIs & Filtering', () => {
    it('1.1 Retrieves active exams with rollup statistics', () => {
      const activeExams = service.listActiveExams();
      assert.strictEqual(activeExams.length, 1);
      assert.strictEqual(activeExams[0].examId, 'exam_cs101');
      assert.strictEqual(activeExams[0].totalCandidates, 3);
    });

    it('1.2 Filters candidates by exam ID and candidate status', () => {
      const allCandidates = service.listCandidates('exam_cs101');
      assert.strictEqual(allCandidates.length, 2);

      const inProgress = service.listCandidates('exam_cs101', 'IN_PROGRESS');
      assert.strictEqual(inProgress.length, 1);
      assert.strictEqual(inProgress[0].candidateSessionId, 'sess_100');

      const suspicious = service.listCandidates('exam_cs101', 'SUSPICIOUS');
      assert.strictEqual(suspicious.length, 1);
      assert.strictEqual(suspicious[0].candidateSessionId, 'sess_101');
    });

    it('1.3 Retrieves candidate details, risk snapshots, and activity timeline', () => {
      const candidate = service.getCandidateDetails('sess_100');
      assert.strictEqual(candidate.candidateName, 'Alex Johnson');

      const snapshot = service.getRiskSnapshot('sess_100');
      assert.strictEqual(snapshot.currentScore, 0.05);

      const timeline = service.getActivityTimeline('sess_100');
      assert.ok(Array.isArray(timeline));
    });
  });

  describe('2. Candidate Status Lifecycle', () => {
    it('2.1 Updates candidate status on disconnect, pause, and submit', () => {
      // Join / In Progress
      service.updateCandidateStatus('sess_100', 'IN_PROGRESS');
      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'IN_PROGRESS');

      // Disconnect
      service.updateCandidateStatus('sess_100', 'DISCONNECTED');
      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'DISCONNECTED');

      // Reconnect & Resume
      service.updateCandidateStatus('sess_100', 'IN_PROGRESS');
      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'IN_PROGRESS');

      // Submitted & Completed
      service.updateCandidateStatus('sess_100', 'SUBMITTED');
      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'SUBMITTED');
    });
  });

  describe('3. Alert Management Lifecycle & Audit Trail', () => {
    it('3.1 Creates alert, acknowledges, escalates, and resolves with audit notes', () => {
      const alert = service.createAlert({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        title: 'Secondary Device Flagged',
        description: 'Smartphone detected in camera field of view',
        priority: 'HIGH',
        severity: 'VIOLATION',
        category: 'VISION'
      });

      assert.strictEqual(alert.status, 'OPEN');
      assert.strictEqual(alert.priority, 'HIGH');

      // Acknowledge
      const acked = service.updateAlertStatus(alert.alertId, 'ACKNOWLEDGED', 'proctor_01', 'Investigating camera mesh');
      assert.strictEqual(acked.status, 'ACKNOWLEDGED');
      assert.strictEqual(acked.acknowledgedBy, 'proctor_01');

      // Escalate
      const escalated = service.updateAlertStatus(alert.alertId, 'ESCALATED', 'proctor_01', 'Escalated to Chief Proctor');
      assert.strictEqual(escalated.status, 'ESCALATED');

      // Resolve
      const resolved = service.updateAlertStatus(alert.alertId, 'RESOLVED', 'proctor_02', 'Confirmed secondary monitor cleared');
      assert.strictEqual(resolved.status, 'RESOLVED');
      assert.strictEqual(resolved.resolvedBy, 'proctor_02');
      assert.ok(resolved.notes?.includes('Chief Proctor'));
    });
  });

  describe('4. Manual Proctor Actions Execution', () => {
    it('4.1 Warns candidate and logs manual action record', () => {
      const action = service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'WARN_CANDIDATE',
        notes: 'Warning: Keep face centered'
      });

      assert.strictEqual(action.actionType, 'WARN_CANDIDATE');
      const cand = service.getCandidateDetails('sess_100');
      assert.strictEqual(cand.manualActionCount, 1);
    });

    it('4.2 Pauses and resumes candidate session', () => {
      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'PAUSE_SESSION',
        notes: 'Pausing for identity verification'
      });

      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'PAUSED');

      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'RESUME_SESSION'
      });

      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'IN_PROGRESS');
    });

    it('4.3 Terminates candidate session and flags submission', () => {
      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'TERMINATE_SESSION',
        notes: 'Severe violation confirmed'
      });

      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'TERMINATED');

      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'FLAG_SUBMISSION'
      });

      assert.strictEqual(service.getCandidateDetails('sess_100').isFlagged, true);
    });
  });

  describe('5. Scalability & Concurrent Edge Cases', () => {
    it('5.1 Scales up to 500+ candidates connected simultaneously', () => {
      for (let i = 1; i <= 500; i++) {
        store.saveCandidate({
          candidateSessionId: `sess_scale_${i}`,
          examId: 'exam_cs101',
          institutionId: 'inst_mit_01',
          candidateId: `cand_scale_${i}`,
          candidateName: `Candidate ${i}`,
          status: i % 10 === 0 ? 'SUSPICIOUS' : 'IN_PROGRESS',
          currentRiskScore: i % 10 === 0 ? 0.85 : 0.05,
          riskLevel: i % 10 === 0 ? 'HIGH' : 'LOW',
          lastHeartbeatAt: new Date().toISOString(),
          isFlagged: i % 10 === 0,
          manualActionCount: 0,
          activeAlertCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      const all = service.listCandidates('exam_cs101');
      assert.strictEqual(all.length, 502); // 500 new + 2 seeded

      const suspicious = service.listCandidates('exam_cs101', 'SUSPICIOUS');
      assert.strictEqual(suspicious.length, 51); // 50 new + 1 seeded
    });

    it('5.2 Handles multiple proctors executing concurrent manual actions on same candidate', () => {
      const action1 = service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_01',
        actionType: 'ADD_MANUAL_NOTE',
        notes: 'Note from Proctor 1'
      });

      const action2 = service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_02',
        actionType: 'WARN_CANDIDATE',
        notes: 'Warning from Proctor 2'
      });

      assert.strictEqual(action1.proctorId, 'proctor_01');
      assert.strictEqual(action2.proctorId, 'proctor_02');

      const cand = service.getCandidateDetails('sess_100');
      assert.strictEqual(cand.manualActionCount, 2);
    });
  });
});
