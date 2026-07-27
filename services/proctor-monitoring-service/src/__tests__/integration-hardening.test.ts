import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MonitoringService } from '../services/monitoring.service';
import { MonitoringStore } from '../db/monitoring-store';

describe('Proctor Monitoring System Integration & Hardening Tests', () => {
  let service: MonitoringService;
  let store: MonitoringStore;

  beforeEach(() => {
    store = MonitoringStore.getInstance();
    store.clear();
    service = new MonitoringService();
  });

  describe('1. API Validation & Multi-Tenant Security', () => {
    it('1.1 Asserts institution tenant isolation for active monitoring queries', () => {
      const candidates = service.listCandidates();
      assert.ok(candidates.every((c) => c.institutionId === 'inst_mit_01'));
    });

    it('1.2 Throws clean NOT_FOUND error when querying non-existent session', () => {
      assert.throws(
        () => service.getCandidateDetails('invalid_session_999'),
        /CANDIDATE_NOT_FOUND/
      );
    });
  });

  describe('2. Risk Snapshot Escalation & State Synchronization', () => {
    it('2.1 Triggers SUSPICIOUS state transition when risk score crosses 0.70 threshold', () => {
      const initial = service.getCandidateDetails('sess_100');
      assert.strictEqual(initial.status, 'IN_PROGRESS');

      service.updateRiskSnapshot('sess_100', 0.78, 'MULTIPLE_FACES_DETECTED');

      const updated = service.getCandidateDetails('sess_100');
      assert.strictEqual(updated.status, 'SUSPICIOUS');
      assert.strictEqual(updated.riskLevel, 'HIGH');
    });
  });

  describe('3. Incident Triage & Alert Resolution Workflow', () => {
    it('3.1 Decrements activeAlertCount on candidate monitor when alert is RESOLVED', () => {
      const alert = service.createAlert({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        title: 'Whisper Audio Detected',
        description: 'VAD module flagged secondary whisper pattern',
        priority: 'MEDIUM',
        severity: 'WARNING',
        category: 'ACOUSTIC'
      });

      const candBefore = service.getCandidateDetails('sess_100');
      assert.strictEqual(candBefore.activeAlertCount, 1);

      service.updateAlertStatus(alert.alertId, 'RESOLVED', 'proctor_admin', 'Ambient fan noise verified');

      const candAfter = service.getCandidateDetails('sess_100');
      assert.strictEqual(candAfter.activeAlertCount, 0);
    });
  });

  describe('4. Performance & Scalability (1,000 Candidates)', () => {
    it('4.1 Aggregates statistics across 1,000 candidates under 15ms', () => {
      for (let i = 1; i <= 1000; i++) {
        store.saveCandidate({
          candidateSessionId: `sess_perf_${i}`,
          examId: 'exam_cs101',
          institutionId: 'inst_mit_01',
          candidateId: `cand_perf_${i}`,
          candidateName: `Perf Candidate ${i}`,
          status: i % 10 === 0 ? 'SUSPICIOUS' : 'IN_PROGRESS',
          currentQuestionId: 'q1',
          currentRiskScore: i % 10 === 0 ? 0.85 : 0.05,
          riskLevel: i % 10 === 0 ? 'HIGH' : 'LOW',
          lastHeartbeatAt: new Date().toISOString(),
          isFlagged: false,
          manualActionCount: 0,
          activeAlertCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      const startTime = performance.now();
      const stats = service.getStats();
      const endTime = performance.now();

      assert.strictEqual(stats.totalMonitoredCandidates, 1002);
      assert.ok(endTime - startTime < 15, 'System stats aggregation for 1,000 candidates must execute in under 15ms');
    });
  });
});
