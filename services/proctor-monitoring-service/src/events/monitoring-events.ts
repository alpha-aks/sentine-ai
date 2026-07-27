import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';

const logger = new Logger({ serviceName: 'proctor-monitoring-service' });
const bus = new InMemoryEventBus();
const publisher = new EventPublisher(bus, { sourceName: 'proctor-monitoring-service' });

export const monitoringEvents = {
  publishCandidateConnected(data: { candidateSessionId: string; examId: string; candidateId: string }) {
    logger.info(`Publishing CandidateConnected for session ${data.candidateSessionId}`);
    return publisher.publish('CandidateConnected', data);
  },

  publishCandidateDisconnected(data: { candidateSessionId: string; examId: string; reason?: string }) {
    logger.info(`Publishing CandidateDisconnected for session ${data.candidateSessionId}`);
    return publisher.publish('CandidateDisconnected', data);
  },

  publishSessionUpdated(data: { candidateSessionId: string; status: string; riskScore: number }) {
    logger.info(`Publishing SessionUpdated for session ${data.candidateSessionId}`);
    return publisher.publish('SessionUpdated', data);
  },

  publishAlertCreated(data: { alertId: string; candidateSessionId: string; category: string; priority: string }) {
    logger.info(`Publishing AlertCreated for alert ${data.alertId}`);
    return publisher.publish('AlertCreated', data);
  },

  publishAlertResolved(data: { alertId: string; candidateSessionId: string; status: string }) {
    logger.info(`Publishing AlertResolved for alert ${data.alertId}`);
    return publisher.publish('AlertResolved', data);
  },

  publishManualActionPerformed(data: { actionId: string; candidateSessionId: string; proctorId: string; actionType: string }) {
    logger.info(`Publishing ManualActionPerformed: ${data.actionType} for session ${data.candidateSessionId}`);
    return publisher.publish('ManualActionPerformed', data);
  },

  publishEvidenceCreated(data: { evidenceId: string; candidateSessionId: string; type: string }) {
    logger.info(`Publishing EvidenceCreated for evidence ${data.evidenceId}`);
    return publisher.publish('EvidenceCreated', data);
  },

  publishRiskUpdated(data: { candidateSessionId: string; riskScore: number; level: string }) {
    logger.info(`Publishing RiskUpdated for session ${data.candidateSessionId}: ${data.riskScore}`);
    return publisher.publish('RiskUpdated', data);
  }
};
