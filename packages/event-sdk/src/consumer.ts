import { retry } from '@sentinel-ai/utils';
import { IEventBus } from './event-bus';
import { EventSerializer, defaultSerializer } from './serialization';
import {
  DeadLetterEvent,
  EventConsumerOptions,
  EventEnvelope,
  EventHandler,
  SubscriptionHandle,
  SubscriptionOptions
} from './types';

export class EventConsumer {
  private readonly bus: IEventBus;
  private readonly defaultMaxRetries: number;
  private readonly defaultRetryDelayMs: number;
  private readonly enableDeduplication: boolean;
  private readonly deduplicationTtlMs: number;
  private readonly processedEventIds: Map<string, number> = new Map();
  private readonly serializer: EventSerializer;

  constructor(
    bus: IEventBus,
    options: EventConsumerOptions = {},
    serializer: EventSerializer = defaultSerializer
  ) {
    this.bus = bus;
    this.defaultMaxRetries = options.defaultMaxRetries ?? 3;
    this.defaultRetryDelayMs = options.defaultRetryDelayMs ?? 200;
    this.enableDeduplication = options.enableDeduplication ?? true;
    this.deduplicationTtlMs = options.deduplicationTtlMs ?? 300000; // 5 minutes
    this.serializer = serializer;

    if (this.enableDeduplication) {
      setInterval(() => this.cleanupDeduplicationCache(), 60000);
    }
  }

  private cleanupDeduplicationCache(): void {
    const now = Date.now();
    for (const [eventId, timestamp] of this.processedEventIds.entries()) {
      if (now - timestamp > this.deduplicationTtlMs) {
        this.processedEventIds.delete(eventId);
      }
    }
  }

  public subscribe<T = any>(
    pattern: string,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): SubscriptionHandle {
    const maxRetries = options.maxRetries ?? this.defaultMaxRetries;
    const initialDelay = options.retryDelayMs ?? this.defaultRetryDelayMs;
    const backoffFactor = options.backoffFactor ?? 2;

    const wrappedHandler: EventHandler<T> = async (event: EventEnvelope<T>) => {
      if (this.enableDeduplication && event.eventId) {
        if (this.processedEventIds.has(event.eventId)) {
          // Duplicate event ignored
          return;
        }
      }

      let attemptCount = 0;
      let lastError: any;

      try {
        await retry(
          async () => {
            attemptCount++;
            await handler(event);
          },
          {
            maxRetries,
            delayMs: initialDelay,
            backoffFactor,
            jitter: true
          }
        );

        if (this.enableDeduplication && event.eventId) {
          this.processedEventIds.set(event.eventId, Date.now());
        }
      } catch (err) {
        lastError = err;
        if (options.deadLetterHandler) {
          const deadLetter: DeadLetterEvent<T> = {
            event,
            error: {
              message: lastError instanceof Error ? lastError.message : String(lastError),
              stack: lastError instanceof Error ? lastError.stack : undefined
            },
            attempts: attemptCount,
            failedAt: new Date().toISOString()
          };

          try {
            await options.deadLetterHandler(deadLetter);
          } catch {
            // DLQ handler execution failure swallowed silently to avoid unhandled promise rejection
          }
        } else {
          throw lastError;
        }
      }
    };

    return this.bus.subscribe(pattern, wrappedHandler, options);
  }

  public consumeRawMessage<T = any>(
    rawMessage: string | Buffer,
    handler: EventHandler<T>,
    secretKey?: string
  ): Promise<void> {
    const envelope = this.serializer.deserialize<T>(rawMessage, secretKey);
    return Promise.resolve(handler(envelope));
  }
}
