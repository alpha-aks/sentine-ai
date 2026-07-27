import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MonitoringService } from '../services/monitoring.service';
import { MonitoringStore } from '../db/monitoring-store';

describe('Proctor Monitoring Service Tests', () => {
  let service: MonitoringService;
  let store: MonitoringStore;

  beforeEach(() => {
    store = MonitoringStore.getInstance();
    store.clear();
    service = new MonitoringService();
  });

  describe('1. Active Exam & Candidate Monitors', () => {
    it('1.1 lists active exams with initial candidate counts', () => {
      const exams = service.listActiveExams();
      assert.strictEqual(exams.length, 1);
      assert.strictEqual(exams[0].examId, 'exam_cs101');
      assert.strictEqual(exams[0].totalCandidates, 3);
    });

    it('1.2 updates candidate proctoring status and logs activity', () => {
      const updated = service.updateCandidateStatus('sess_100', 'PAUSED');
      assert.strictEqual(updated.status, 'PAUSED');

      const timeline = service.getActivityTimeline('sess_100');
      assert.strictEqual(timeline.length, 1);
      assert.strictEqual(timeline[0].eventType, 'STATUS_CHANGED');
    });
  });

  describe('2. Risk Snapshots & History', () => {
    it('2.1 updates risk snapshot score and triggers suspicious status when score >= 0.7', () => {
      const snapshot = service.updateRiskSnapshot('sess_100', 0.88, 'OFFSCREEN_GAZE_FLAG');
      assert.strictEqual(snapshot.currentScore, 0.88);
      assert.strictEqual(snapshot.level, 'CRITICAL');

      const cand = service.getCandidateDetails('sess_100');
      assert.strictEqual(cand.status, 'SUSPICIOUS');
      assert.strictEqual(cand.currentRiskScore, 0.88);
    });
  });

  describe('3. Evidence Metadata Registration', () => {
    it('3.1 registers evidence metadata correctly', () => {
      const evidence = service.registerEvidence({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        type: 'SCREENSHOT',
        title: 'Secondary Screen Detection',
        storageUri: 's3://sentinel-evidence/sess_100/screen_01.png',
        mimeType: 'image/png',
        sizeBytes: 102450
      });

      assert.strictEqual(evidence.type, 'SCREENSHOT');
      assert.strictEqual(evidence.candidateSessionId, 'sess_100');

      const list = service.getEvidenceList('sess_100');
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].evidenceId, evidence.evidenceId);
    });
  });

  describe('4. Alert Lifecycle Management', () => {
    it('4.1 creates and resolves alert entity', () => {
      const alert = service.createAlert({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        title: 'Acoustic Whisper Detected',
        description: 'VAD module flagged secondary voice audio pattern.',
        priority: 'HIGH',
        severity: 'VIOLATION',
        category: 'ACOUSTIC'
      });

      assert.strictEqual(alert.status, 'OPEN');
      assert.strictEqual(alert.priority, 'HIGH');

      const resolved = service.updateAlertStatus(alert.alertId, 'RESOLVED', 'proctor_99', 'False positive verified');
      assert.strictEqual(resolved.status, 'RESOLVED');
      assert.strictEqual(resolved.resolvedBy, 'proctor_99');
    });
  });

  describe('5. Manual Proctor Actions', () => {
    it('5.1 executes WARN_CANDIDATE and logs manual audit action', () => {
      const action = service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_01',
        actionType: 'WARN_CANDIDATE',
        notes: 'Please face the webcam directly.'
      });

      assert.strictEqual(action.actionType, 'WARN_CANDIDATE');
      assert.strictEqual(action.proctorId, 'proctor_01');

      const cand = service.getCandidateDetails('sess_100');
      assert.strictEqual(cand.manualActionCount, 1);
    });

    it('5.2 executes TERMINATE_SESSION and sets candidate status to TERMINATED', () => {
      service.executeManualAction({
        candidateSessionId: 'sess_100',
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        proctorId: 'proctor_01',
        actionType: 'TERMINATE_SESSION',
        notes: 'Severe unapproved secondary material.'
      });

      const cand = service.getCandidateDetails('sess_100');
      assert.strictEqual(cand.status, 'TERMINATED');
    });
  });

  describe('6. System Aggregated Statistics', () => {
    it('6.1 returns accurate proctoring stats', () => {
      const stats = service.getStats();
      assert.strictEqual(stats.activeExamsCount, 1);
      assert.strictEqual(stats.totalMonitoredCandidates, 2);
      assert.strictEqual(stats.openAlertsCount, 1);
    });
  });
});
