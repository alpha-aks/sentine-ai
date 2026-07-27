import { generateUuid } from '@sentinel-ai/utils';
import { EventType } from '@sentinel-ai/types';
import { IEventBus } from './event-bus';
import { EventSerializer, defaultSerializer } from './serialization';
import { EventEnvelope, EventPublisherOptions } from './types';

export type PublisherMiddleware = (event: EventEnvelope) => EventEnvelope | Promise<EventEnvelope>;

export class EventPublisher {
  private readonly bus: IEventBus;
  private readonly sourceName: string;
  private readonly secretKey?: string;
  private readonly enableSigning: boolean;
  private readonly serializer: EventSerializer;
  private readonly middlewares: PublisherMiddleware[] = [];

  constructor(
    bus: IEventBus,
    options: EventPublisherOptions = {},
    serializer: EventSerializer = defaultSerializer
  ) {
    this.bus = bus;
    this.sourceName = options.sourceName || 'sentinel-ai';
    this.secretKey = options.secretKey;
    this.enableSigning = options.enableSigning ?? !!options.secretKey;
    this.serializer = serializer;
  }

  public use(middleware: PublisherMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  public createEnvelope<T = any>(
    eventType: EventType | string,
    payload: T,
    correlationId?: string
  ): EventEnvelope<T> {
    return {
      eventId: generateUuid(),
      eventType,
      source: this.sourceName,
      timestamp: new Date().toISOString(),
      correlationId,
      version: '1.0',
      payload
    };
  }

  public async publish<T = any>(
    eventType: EventType | string,
    payload: T,
    correlationId?: string
  ): Promise<EventEnvelope<T>> {
    const rawEnvelope = this.createEnvelope(eventType, payload, correlationId);
    return this.publishEnvelope(rawEnvelope);
  }

  public async publishEnvelope<T = any>(envelope: EventEnvelope<T>): Promise<EventEnvelope<T>> {
    let processedEnvelope: EventEnvelope<T> = { ...envelope };

    for (const middleware of this.middlewares) {
      processedEnvelope = (await middleware(processedEnvelope)) as EventEnvelope<T>;
    }

    if (this.enableSigning && this.secretKey) {
      // Serialize and deserialize to derive canonical signature
      const serialized = this.serializer.serialize(processedEnvelope, this.secretKey);
      processedEnvelope = this.serializer.deserialize(serialized);
    }

    await this.bus.publish(processedEnvelope);
    return processedEnvelope;
  }

  public async publishBatch<T = any>(
    items: Array<{ eventType: EventType | string; payload: T; correlationId?: string }>
  ): Promise<EventEnvelope<T>[]> {
    const results: EventEnvelope<T>[] = [];
    for (const item of items) {
      const published = await this.publish(item.eventType, item.payload, item.correlationId);
      results.push(published);
    }
    return results;
  }
}
