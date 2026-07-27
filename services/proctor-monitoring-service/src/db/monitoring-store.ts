import {
  CandidateMonitor,
  LiveExamMonitor,
  RiskSnapshot,
  SessionActivity,
  EvidenceMetadata,
  AlertEntity,
  ManualActionRecord,
  CandidateStatus
} from '../types/monitoring.types';

export class MonitoringStore {
  private static instance: MonitoringStore;

  private candidates = new Map<string, CandidateMonitor>();
  private exams = new Map<string, LiveExamMonitor>();
  private riskSnapshots = new Map<string, RiskSnapshot>();
  private sessionActivities = new Map<string, SessionActivity[]>();
  private evidenceMap = new Map<string, EvidenceMetadata[]>();
  private alerts = new Map<string, AlertEntity>();
  private manualActions = new Map<string, ManualActionRecord[]>();

  private constructor() {
    this.seedDefaultData();
  }

  public static getInstance(): MonitoringStore {
    if (!MonitoringStore.instance) {
      MonitoringStore.instance = new MonitoringStore();
    }
    return MonitoringStore.instance;
  }

  public clear(): void {
    this.candidates.clear();
    this.exams.clear();
    this.riskSnapshots.clear();
    this.sessionActivities.clear();
    this.evidenceMap.clear();
    this.alerts.clear();
    this.manualActions.clear();
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    const exam101: LiveExamMonitor = {
      examId: 'exam_cs101',
      institutionId: 'inst_mit_01',
      examCode: 'CS101-2026',
      title: 'Advanced Computer Science & Algorithms',
      totalCandidates: 3,
      inProgressCandidates: 2,
      pausedCandidates: 0,
      suspiciousCandidates: 1,
      terminatedCandidates: 0,
      submittedCandidates: 0,
      averageRiskScore: 0.18,
      activeAlertsCount: 1,
      updatedAt: new Date().toISOString()
    };
    this.exams.set(exam101.examId, exam101);

    const cand100: CandidateMonitor = {
      candidateSessionId: 'sess_100',
      examId: 'exam_cs101',
      institutionId: 'inst_mit_01',
      candidateId: 'cand_100',
      candidateName: 'Alex Johnson',
      status: 'IN_PROGRESS',
      currentQuestionId: 'q1',
      currentRiskScore: 0.05,
      riskLevel: 'LOW',
      lastHeartbeatAt: new Date().toISOString(),
      isFlagged: false,
      manualActionCount: 0,
      activeAlertCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.candidates.set(cand100.candidateSessionId, cand100);

    const cand101: CandidateMonitor = {
      candidateSessionId: 'sess_101',
      examId: 'exam_cs101',
      institutionId: 'inst_mit_01',
      candidateId: 'cand_101',
      candidateName: 'Sarah Jenkins',
      status: 'SUSPICIOUS',
      currentQuestionId: 'q3',
      currentRiskScore: 0.72,
      riskLevel: 'HIGH',
      lastHeartbeatAt: new Date().toISOString(),
      isFlagged: true,
      manualActionCount: 1,
      activeAlertCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.candidates.set(cand101.candidateSessionId, cand101);

    const alert1: AlertEntity = {
      alertId: 'alert_301',
      candidateSessionId: 'sess_101',
      examId: 'exam_cs101',
      institutionId: 'inst_mit_01',
      title: 'Secondary Device Flagged in Frame',
      description: 'Vision mesh vector detected smartphone in peripheral camera view.',
      priority: 'HIGH',
      severity: 'VIOLATION',
      category: 'VISION',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.alerts.set(alert1.alertId, alert1);
  }

  // Candidate Monitor Queries & Mutations
  public getCandidate(sessionId: string): CandidateMonitor | undefined {
    return this.candidates.get(sessionId);
  }

  public listCandidates(examId?: string, status?: CandidateStatus): CandidateMonitor[] {
    let list = Array.from(this.candidates.values());
    if (examId) list = list.filter((c) => c.examId === examId);
    if (status) list = list.filter((c) => c.status === status);
    return list;
  }

  public saveCandidate(candidate: CandidateMonitor): CandidateMonitor {
    this.candidates.set(candidate.candidateSessionId, candidate);
    return candidate;
  }

  // Active Exam Rollup Queries
  public getExam(examId: string): LiveExamMonitor | undefined {
    return this.exams.get(examId);
  }

  public listExams(): LiveExamMonitor[] {
    return Array.from(this.exams.values());
  }

  public saveExam(exam: LiveExamMonitor): LiveExamMonitor {
    this.exams.set(exam.examId, exam);
    return exam;
  }

  // Risk Snapshots
  public getRiskSnapshot(sessionId: string): RiskSnapshot {
    const existing = this.riskSnapshots.get(sessionId);
    if (existing) return existing;

    const cand = this.getCandidate(sessionId);
    const initial: RiskSnapshot = {
      candidateSessionId: sessionId,
      currentScore: cand ? cand.currentRiskScore : 0.05,
      level: cand ? cand.riskLevel : 'LOW',
      historySummary: [
        {
          timestamp: new Date().toISOString(),
          score: cand ? cand.currentRiskScore : 0.05,
          eventName: 'INITIALIZATION'
        }
      ],
      updatedAt: new Date().toISOString()
    };
    this.riskSnapshots.set(sessionId, initial);
    return initial;
  }

  public saveRiskSnapshot(snapshot: RiskSnapshot): RiskSnapshot {
    this.riskSnapshots.set(snapshot.candidateSessionId, snapshot);
    return snapshot;
  }

  // Activity Timeline
  public getActivities(sessionId: string): SessionActivity[] {
    return this.sessionActivities.get(sessionId) || [];
  }

  public addActivity(activity: SessionActivity): SessionActivity {
    const list = this.getActivities(activity.candidateSessionId);
    list.push(activity);
    this.sessionActivities.set(activity.candidateSessionId, list);
    return activity;
  }

  // Evidence Metadata
  public getEvidenceList(sessionId: string): EvidenceMetadata[] {
    return this.evidenceMap.get(sessionId) || [];
  }

  public addEvidence(evidence: EvidenceMetadata): EvidenceMetadata {
    const list = this.getEvidenceList(evidence.candidateSessionId);
    list.push(evidence);
    this.evidenceMap.set(evidence.candidateSessionId, list);
    return evidence;
  }

  // Alerts
  public getAlert(alertId: string): AlertEntity | undefined {
    return this.alerts.get(alertId);
  }

  public listAlerts(examId?: string, status?: string): AlertEntity[] {
    let list = Array.from(this.alerts.values());
    if (examId) list = list.filter((a) => a.examId === examId);
    if (status) list = list.filter((a) => a.status === status);
    return list;
  }

  public saveAlert(alert: AlertEntity): AlertEntity {
    this.alerts.set(alert.alertId, alert);
    return alert;
  }

  // Manual Actions
  public getManualActions(sessionId: string): ManualActionRecord[] {
    return this.manualActions.get(sessionId) || [];
  }

  public addManualAction(action: ManualActionRecord): ManualActionRecord {
    const list = this.getManualActions(action.candidateSessionId);
    list.push(action);
    this.manualActions.set(action.candidateSessionId, list);
    return action;
  }
}
