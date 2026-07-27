import { TelemetryVector, OrchestratedDecision, Alert } from './domain';

export type EventType =
  | 'CONNECTED'
  | 'TELEMETRY_VECTOR'
  | 'DECISION_UPDATE'
  | 'ALERT_TRIGGERED'
  | 'PROCTOR_ACTION_EXECUTED'
  | 'HEARTBEAT'
  | 'ERROR';

export interface BaseEvent<TType extends EventType, TPayload> {
  type: TType;
  payload: TPayload;
  timestamp?: string;
}

export type ConnectedEvent = BaseEvent<'CONNECTED', { message: string }>;

export type TelemetryVectorEvent = BaseEvent<'TELEMETRY_VECTOR', TelemetryVector>;

export type DecisionUpdateEvent = BaseEvent<'DECISION_UPDATE', OrchestratedDecision>;

export type AlertTriggeredEvent = BaseEvent<'ALERT_TRIGGERED', Alert>;

export type ProctorActionEvent = BaseEvent<
  'PROCTOR_ACTION_EXECUTED',
  {
    alertId: string;
    action: string;
    sessionId?: string;
    notes?: string;
    logHash?: string;
  }
>;

export type HeartbeatEvent = BaseEvent<'HEARTBEAT', { uptimeSeconds: number }>;

export type ErrorEvent = BaseEvent<'ERROR', { message: string; code?: string }>;

export type WebSocketEvent =
  | ConnectedEvent
  | TelemetryVectorEvent
  | DecisionUpdateEvent
  | AlertTriggeredEvent
  | ProctorActionEvent
  | HeartbeatEvent
  | ErrorEvent;
