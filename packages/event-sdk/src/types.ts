import { EventType } from '@sentinel-ai/types';

export interface EventEnvelope<TPayload = any> {
  eventId: string;
  eventType: EventType | string;
  source: string;
  timestamp: string;
  correlationId?: string;
  version?: string;
  signature?: string;
  payload: TPayload;
}

export type EventHandler<TPayload = any> = (event: EventEnvelope<TPayload>) => Promise<void> | void;

export type DeadLetterHandler<TPayload = any> = (
  deadLetter: DeadLetterEvent<TPayload>
) => Promise<void> | void;

export interface DeadLetterEvent<TPayload = any> {
  event: EventEnvelope<TPayload>;
  error: {
    message: string;
    stack?: string;
  };
  attempts: number;
  failedAt: string;
}

export interface SubscriptionOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  backoffFactor?: number;
  deadLetterHandler?: DeadLetterHandler;
  filter?: (event: EventEnvelope) => boolean;
}

export interface SubscriptionHandle {
  subscriptionId: string;
  eventTypePattern: string;
  unsubscribe: () => void;
}

export interface EventPublisherOptions {
  sourceName?: string;
  secretKey?: string;
  enableSigning?: boolean;
}

export interface EventConsumerOptions {
  consumerId?: string;
  defaultMaxRetries?: number;
  defaultRetryDelayMs?: number;
  enableDeduplication?: boolean;
  deduplicationTtlMs?: number;
}
