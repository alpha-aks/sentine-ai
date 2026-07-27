import { generateShortId } from '@sentinel-ai/utils';
import { EventEnvelope, EventHandler, SubscriptionHandle, SubscriptionOptions } from './types';

interface InternalSubscription {
  id: string;
  pattern: string;
  handler: EventHandler;
  options?: SubscriptionOptions;
  regex: RegExp;
}

export interface IEventBus {
  publish<T = any>(event: EventEnvelope<T>): Promise<void>;
  subscribe<T = any>(
    pattern: string,
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): SubscriptionHandle;
  unsubscribe(subscriptionId: string): void;
  clear(): void;
  listenerCount(pattern?: string): number;
}

export class InMemoryEventBus implements IEventBus {
  private subscriptions: Map<string, InternalSubscription> = new Map();

  private patternToRegex(pattern: string): RegExp {
    if (pattern === '*' || pattern === '#') {
      return /^.*$/;
    }
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^.:]+')
      .replace(/#/g, '.*');
    return new RegExp(`^${escaped}$`, 'i');
  }

  public subscribe<T = any>(
    pattern: string,
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): SubscriptionHandle {
    if (!pattern || typeof pattern !== 'string') {
      throw new Error('Subscribe failed: Pattern must be a non-empty string');
    }
    if (typeof handler !== 'function') {
      throw new Error('Subscribe failed: Handler must be a function');
    }

    const subscriptionId = `sub_${generateShortId(10)}`;
    const regex = this.patternToRegex(pattern);

    const subscription: InternalSubscription = {
      id: subscriptionId,
      pattern,
      handler: handler as EventHandler,
      options,
      regex
    };

    this.subscriptions.set(subscriptionId, subscription);

    return {
      subscriptionId,
      eventTypePattern: pattern,
      unsubscribe: () => this.unsubscribe(subscriptionId)
    };
  }

  public unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  public clear(): void {
    this.subscriptions.clear();
  }

  public listenerCount(pattern?: string): number {
    if (!pattern) return this.subscriptions.size;
    const targetRegex = this.patternToRegex(pattern);
    let count = 0;
    for (const sub of this.subscriptions.values()) {
      if (sub.pattern === pattern || targetRegex.test(sub.pattern)) {
        count++;
      }
    }
    return count;
  }

  public async publish<T = any>(event: EventEnvelope<T>): Promise<void> {
    if (!event || !event.eventType) {
      throw new Error('Publish failed: Event must contain an eventType');
    }

    const matchingSubscriptions: InternalSubscription[] = [];

    for (const sub of this.subscriptions.values()) {
      if (sub.regex.test(event.eventType)) {
        if (sub.options?.filter && !sub.options.filter(event)) {
          continue;
        }
        matchingSubscriptions.push(sub);
      }
    }

    // Execute handlers asynchronously so publisher is non-blocking
    const dispatchPromises = matchingSubscriptions.map(async sub => {
      try {
        await sub.handler(event);
      } catch (err) {
        // Unhandled handler errors can be caught or passed to subscription dead-letter logic
        if (sub.options?.deadLetterHandler) {
          try {
            await sub.options.deadLetterHandler({
              event,
              error: {
                message: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined
              },
              attempts: 1,
              failedAt: new Date().toISOString()
            });
          } catch {
            // Silence DLQ failure
          }
        }
      }
    });

    await Promise.all(dispatchPromises);
  }
}
