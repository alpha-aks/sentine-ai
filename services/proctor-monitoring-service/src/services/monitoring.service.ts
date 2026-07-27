import { MonitoringStore } from '../db/monitoring-store';
import { monitoringEvents } from '../events/monitoring-events';
import { MonitoringWebSocketManager } from '../websocket/monitoring-ws';
import {
  CandidateMonitor,
  LiveExamMonitor,
  RiskSnapshot,
  SessionActivity,
  EvidenceMetadata,
  AlertEntity,
  ManualActionRecord,
  CandidateStatus,
  AlertPriority,
  AlertSeverity,
  AlertCategory,
  AlertStatus,
  ManualActionType,
  EvidenceType
} from '../types/monitoring.types';

export class MonitoringService {
  private store = MonitoringStore.getInstance();
  private wsManager = MonitoringWebSocketManager.getInstance();

  // Active Exams
  public listActiveExams(): LiveExamMonitor[] {
    return this.store.listExams();
  }

  public getExamDetails(examId: string): LiveExamMonitor {
    const exam = this.store.getExam(examId);
    if (!exam) {
      throw new Error(`EXAM_NOT_FOUND: Active exam with ID ${examId} does not exist.`);
    }
    return exam;
  }

  // Candidate Monitoring
  public listCandidates(examId?: string, status?: CandidateStatus): CandidateMonitor[] {
    return this.store.listCandidates(examId, status);
  }

  public recordHeartbeat(sessionId: string, status?: CandidateStatus): CandidateMonitor {
    let cand = this.store.getCandidate(sessionId);
    if (!cand) {
      cand = {
        candidateSessionId: sessionId,
        examId: 'exam_cs101',
        institutionId: 'inst_mit_01',
        candidateId: 'cand_100',
        candidateName: 'Alex Johnson',
        status: status || 'IN_PROGRESS',
        currentRiskScore: 0.1,
        riskLevel: 'LOW',
        lastHeartbeatAt: new Date().toISOString(),
        isFlagged: false,
        manualActionCount: 0,
        activeAlertCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      cand.lastHeartbeatAt = new Date().toISOString();
      if (status) cand.status = status;
      cand.updatedAt = new Date().toISOString();
    }
    this.store.saveCandidate(cand);
    return cand;
  }

  public getCandidateDetails(sessionId: string): CandidateMonitor {
    const cand = this.store.getCandidate(sessionId);
    if (!cand) {
      throw new Error(`CANDIDATE_NOT_FOUND: Candidate session with ID ${sessionId} not found.`);
    }
    return cand;
  }

  public updateCandidateStatus(sessionId: string, newStatus: CandidateStatus): CandidateMonitor {
    const cand = this.getCandidateDetails(sessionId);
    cand.status = newStatus;
    cand.updatedAt = new Date().toISOString();
    this.store.saveCandidate(cand);

    // Record Activity
    this.addActivity(sessionId, 'STATUS_CHANGED', `Candidate status updated to ${newStatus}`);

    // Publish event & WS broadcast
    monitoringEvents.publishSessionUpdated({
      candidateSessionId: sessionId,
      status: newStatus,
      riskScore: cand.currentRiskScore
    });

    this.wsManager.broadcastToChannel(`EXAM_CHANNEL:${cand.examId}`, {
      type: 'CANDIDATE_STATUS_CHANGED',
      candidateSessionId: sessionId,
      status: newStatus
    });

    return cand;
  }

  // Risk Snapshots
  public getRiskSnapshot(sessionId: string): RiskSnapshot {
    return this.store.getRiskSnapshot(sessionId);
  }

  public updateRiskSnapshot(sessionId: string, score: number, eventName?: string): RiskSnapshot {
    const snapshot = this.getRiskSnapshot(sessionId);
    snapshot.currentScore = score;
    snapshot.level = score >= 0.85 ? 'CRITICAL' : score >= 0.7 ? 'HIGH' : score >= 0.4 ? 'MEDIUM' : 'LOW';
    snapshot.latestEventName = eventName || 'RISK_UPDATE';
    snapshot.latestEventTimestamp = new Date().toISOString();
    snapshot.historySummary.push({
      timestamp: new Date().toISOString(),
      score,
      eventName
    });
    snapshot.updatedAt = new Date().toISOString();
    this.store.saveRiskSnapshot(snapshot);

    // Update candidate record
    const cand = this.store.getCandidate(sessionId);
    if (cand) {
      cand.currentRiskScore = score;
      cand.riskLevel = snapshot.level;
      if (score >= 0.7) cand.status = 'SUSPICIOUS';
      this.store.saveCandidate(cand);
    }

    monitoringEvents.publishRiskUpdated({
      candidateSessionId: sessionId,
      riskScore: score,
      level: snapshot.level
    });

    this.wsManager.broadcastToChannel(`CANDIDATE_CHANNEL:${sessionId}`, {
      type: 'RISK_UPDATED',
      riskScore: score,
      level: snapshot.level
    });

    return snapshot;
  }

  // Session Activities Timeline
  public getActivityTimeline(sessionId: string): SessionActivity[] {
    return this.store.getActivities(sessionId);
  }

  public addActivity(sessionId: string, eventType: string, description: string, metadata?: Record<string, any>): SessionActivity {
    const activity: SessionActivity = {
      activityId: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      candidateSessionId: sessionId,
      eventType,
      description,
      metadata,
      timestamp: new Date().toISOString()
    };
    return this.store.addActivity(activity);
  }

  // Evidence Metadata
  public getEvidenceList(sessionId: string): EvidenceMetadata[] {
    return this.store.getEvidenceList(sessionId);
  }

  public registerEvidence(dto: {
    candidateSessionId: string;
    examId: string;
    type: EvidenceType;
    title: string;
    storageUri: string;
    mimeType: string;
    sizeBytes: number;
    metadata?: Record<string, any>;
  }): EvidenceMetadata {
    const evidence: EvidenceMetadata = {
      evidenceId: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      candidateSessionId: dto.candidateSessionId,
      examId: dto.examId,
      type: dto.type,
      title: dto.title,
      storageUri: dto.storageUri,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      recordedAt: new Date().toISOString(),
      metadata: dto.metadata
    };

    const saved = this.store.addEvidence(evidence);

    monitoringEvents.publishEvidenceCreated({
      evidenceId: saved.evidenceId,
      candidateSessionId: saved.candidateSessionId,
      type: saved.type
    });

    return saved;
  }

  // Alert Management
  public listAlerts(examId?: string, status?: string): AlertEntity[] {
    return this.store.listAlerts(examId, status);
  }

  public createAlert(dto: {
    candidateSessionId: string;
    examId: string;
    institutionId: string;
    title: string;
    description: string;
    priority: AlertPriority;
    severity: AlertSeverity;
    category: AlertCategory;
    notes?: string;
  }): AlertEntity {
    const alert: AlertEntity = {
      alertId: `alert_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      candidateSessionId: dto.candidateSessionId,
      examId: dto.examId,
      institutionId: dto.institutionId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      severity: dto.severity,
      category: dto.category,
      status: 'OPEN',
      notes: dto.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = this.store.saveAlert(alert);

    // Update candidate & exam counts
    const cand = this.store.getCandidate(dto.candidateSessionId);
    if (cand) {
      cand.activeAlertCount += 1;
      this.store.saveCandidate(cand);
    }

    monitoringEvents.publishAlertCreated({
      alertId: saved.alertId,
      candidateSessionId: saved.candidateSessionId,
      category: saved.category,
      priority: saved.priority
    });

    this.wsManager.broadcastToChannel(`EXAM_CHANNEL:${dto.examId}`, {
      type: 'ALERT_CREATED',
      alert: saved
    });

    return saved;
  }

  public updateAlertStatus(
    alertId: string,
    newStatus: AlertStatus,
    proctorId: string,
    notes?: string
  ): AlertEntity {
    const alert = this.store.getAlert(alertId);
    if (!alert) {
      throw new Error(`ALERT_NOT_FOUND: Alert with ID ${alertId} does not exist.`);
    }

    alert.status = newStatus;
    alert.updatedAt = new Date().toISOString();

    if (newStatus === 'ACKNOWLEDGED') {
      alert.acknowledgedBy = proctorId;
    } else if (newStatus === 'RESOLVED') {
      alert.resolvedBy = proctorId;
      const cand = this.store.getCandidate(alert.candidateSessionId);
      if (cand && cand.activeAlertCount > 0) {
        cand.activeAlertCount -= 1;
        this.store.saveCandidate(cand);
      }
    }

    if (notes) {
      alert.notes = alert.notes ? `${alert.notes} | ${notes}` : notes;
    }

    this.store.saveAlert(alert);

    monitoringEvents.publishAlertResolved({
      alertId: alert.alertId,
      candidateSessionId: alert.candidateSessionId,
      status: newStatus
    });

    return alert;
  }

  // Manual Proctor Actions
  public executeManualAction(dto: {
    candidateSessionId: string;
    examId: string;
    institutionId: string;
    proctorId: string;
    actionType: ManualActionType;
    notes?: string;
  }): ManualActionRecord {
    const cand = this.getCandidateDetails(dto.candidateSessionId);

    const record: ManualActionRecord = {
      actionId: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      candidateSessionId: dto.candidateSessionId,
      examId: dto.examId,
      institutionId: dto.institutionId,
      proctorId: dto.proctorId,
      actionType: dto.actionType,
      notes: dto.notes,
      timestamp: new Date().toISOString()
    };

    this.store.addManualAction(record);
    cand.manualActionCount += 1;

    // Execute state changes based on action type
    if (dto.actionType === 'PAUSE_SESSION') {
      cand.status = 'PAUSED';
    } else if (dto.actionType === 'RESUME_SESSION') {
      cand.status = 'IN_PROGRESS';
    } else if (dto.actionType === 'TERMINATE_SESSION') {
      cand.status = 'TERMINATED';
    } else if (dto.actionType === 'FLAG_SUBMISSION') {
      cand.isFlagged = true;
    }

    this.store.saveCandidate(cand);

    this.addActivity(
      dto.candidateSessionId,
      `MANUAL_ACTION_${dto.actionType}`,
      `Proctor performed ${dto.actionType}: ${dto.notes || 'No notes'}`
    );

    monitoringEvents.publishManualActionPerformed({
      actionId: record.actionId,
      candidateSessionId: record.candidateSessionId,
      proctorId: dto.proctorId,
      actionType: dto.actionType
    });

    this.wsManager.broadcastToChannel(`CANDIDATE_CHANNEL:${dto.candidateSessionId}`, {
      type: 'PROCTOR_ACTION_EXECUTED',
      actionType: dto.actionType,
      notes: dto.notes
    });

    return record;
  }

  // Overall Statistics
  public getStats() {
    return this.getSystemStats();
  }

  public getSystemStats(): {
    activeExamsCount: number;
    totalMonitoredCandidates: number;
    suspiciousCandidatesCount: number;
    openAlertsCount: number;
  } {
    const exams = this.store.listExams();
    const cands = this.store.listCandidates();
    const alerts = this.store.listAlerts(undefined, 'OPEN');

    return {
      activeExamsCount: exams.length,
      totalMonitoredCandidates: cands.length,
      suspiciousCandidatesCount: cands.filter((c) => c.status === 'SUSPICIOUS').length,
      openAlertsCount: alerts.length
    };
  }
}
