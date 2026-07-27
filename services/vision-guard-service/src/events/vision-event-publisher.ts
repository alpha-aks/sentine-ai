import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import { VisionEventPayload } from '../types/vision.types';

const logger = new Logger({ serviceName: 'vision-event-publisher' });

export class VisionEventPublisher {
  private static instance: VisionEventPublisher;
  private publisher: EventPublisher;

  private constructor() {
    const bus = new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'vision-guard-service' });
  }

  public static getInstance(): VisionEventPublisher {
    if (!VisionEventPublisher.instance) {
      VisionEventPublisher.instance = new VisionEventPublisher();
    }
    return VisionEventPublisher.instance;
  }

  public async publishVisionEvent(event: VisionEventPayload): Promise<void> {
    logger.info(
      `Publishing Vision Guard Event: ${event.eventType} for session ${event.candidateSessionId} (Confidence: ${event.confidence})`
    );

    await this.publisher.publish(`VISION_${event.eventType}`, {
      eventId: event.eventId,
      eventType: event.eventType,
      candidateId: event.candidateId,
      candidateSessionId: event.candidateSessionId,
      institutionId: event.institutionId,
      examId: event.examId,
      timestamp: event.timestamp,
      confidence: event.confidence,
      metadata: event.metadata
    });
  }
}
