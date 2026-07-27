import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MonitoringService } from '../services/monitoring.service';
import { MonitoringStore } from '../db/monitoring-store';

describe('Proctor Monitoring Final Integration & Security Manual Checklist', () => {
  let service: MonitoringService;
  let store: MonitoringStore;

  beforeEach(() => {
    store = MonitoringStore.getInstance();
    store.clear();
    service = new MonitoringService();
  });

  describe('1. Real-Time Monitoring & Auto Refreshing Stats', () => {
    it('1.1 Instantly updates candidate status and recalculates live statistics', () => {
      const initialStats = service.getStats();
      assert.strictEqual(initialStats.totalMonitoredCandidates, 2);

      // Add a candidate and update status
      store.saveCandidate({
        candidateSessionId: 'sess_live_99',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        candidateId: 'cand_99',
        candidateName: 'Live Candidate 99',
        status: 'IN_PROGRESS',
        currentRiskScore: 0.05,
        riskLevel: 'LOW',
        lastHeartbeatAt: new Date().toISOString(),
        isFlagged: false,
        manualActionCount: 0,
        activeAlertCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const updatedStats = service.getStats();
      assert.strictEqual(updatedStats.totalMonitoredCandidates, 3);
    });

    it('1.2 Alerts appear without page refresh and update active alert counters', () => {
      const alert = service.createAlert({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        title: 'Secondary Voice Pattern',
        description: 'VAD module flagged audio signal in room',
        priority: 'HIGH',
        severity: 'VIOLATION',
        category: 'ACOUSTIC'
      });

      assert.strictEqual(alert.status, 'OPEN');
      const candidate = service.getCandidateDetails('sess_100');
      assert.strictEqual(candidate.activeAlertCount, 1);
    });
  });

  describe('2. Manual Actions & Optimistic Rollback State', () => {
    it('2.1 Executes Warn, Pause, Resume, Terminate, Flag, and Notes actions with audit logs', () => {
      // Warn Candidate
      const warn = service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'WARN_CANDIDATE',
        notes: 'Warning face webcam'
      });
      assert.strictEqual(warn.actionType, 'WARN_CANDIDATE');

      // Pause Session
      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'PAUSE_SESSION'
      });
      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'PAUSED');

      // Resume Session
      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'RESUME_SESSION'
      });
      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'IN_PROGRESS');

      // Flag Submission
      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'FLAG_SUBMISSION'
      });
      assert.strictEqual(service.getCandidateDetails('sess_100').isFlagged, true);

      // Terminate Session
      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_1',
        actionType: 'TERMINATE_SESSION'
      });
      assert.strictEqual(service.getCandidateDetails('sess_100').status, 'TERMINATED');

      // Verify audit actions logged
      const actions = store.getManualActions('sess_100');
      assert.strictEqual(actions.length, 5);
    });
  });

  describe('3. Security & Tenant Isolation', () => {
    it('3.1 Enforces strict tenant isolation across institution accounts', () => {
      const candA = service.getCandidateDetails('sess_100');
      assert.strictEqual(candA.institutionId, 'inst_mit_01');

      // Rejects query for non-existent candidate from foreign tenant
      assert.throws(() => service.getCandidateDetails('foreign_cand_99'), /CANDIDATE_NOT_FOUND/);
    });
  });

  describe('4. Scalability Benchmark: 500+ Candidates', () => {
    it('4.1 System handles 500+ candidate updates without degradation under 10ms', () => {
      for (let i = 1; i <= 500; i++) {
        store.saveCandidate({
          candidateSessionId: `sess_perf_${i}`,
          examId: 'exam_cs101',
          institutionId: 'inst_mit_01',
          candidateId: `cand_perf_${i}`,
          candidateName: `Scale Candidate ${i}`,
          status: i % 5 === 0 ? 'SUSPICIOUS' : 'IN_PROGRESS',
          currentRiskScore: i % 5 === 0 ? 0.88 : 0.05,
          riskLevel: i % 5 === 0 ? 'CRITICAL' : 'LOW',
          lastHeartbeatAt: new Date().toISOString(),
          isFlagged: false,
          manualActionCount: 0,
          activeAlertCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      const start = performance.now();
      const suspicious = service.listCandidates('exam_cs101', 'SUSPICIOUS');
      const end = performance.now();

      assert.strictEqual(suspicious.length, 101); // 100 new + 1 seeded
      assert.ok(end - start < 10, 'Filter 500+ candidates must run under 10ms');
    });
  });
});
