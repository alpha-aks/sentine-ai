import { EventConsumer, EventEnvelope, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import { UserRepository } from '../db/UserRepository';
import { UserEntity } from '../types/user';

export class UserEventConsumer {
  private readonly consumer: EventConsumer;
  private readonly repository: UserRepository;
  private readonly logger: Logger;

  constructor(eventBus: InMemoryEventBus, repository: UserRepository, logger?: Logger) {
    this.consumer = new EventConsumer(eventBus, { defaultMaxRetries: 3 });
    this.repository = repository;
    this.logger = logger || new Logger({ serviceName: 'user-service-consumer' });
  }

  public subscribeToAuthEvents(): void {
    // Listen to UserRegistered events emitted by Auth Service
    this.consumer.subscribe('UserRegistered', async (event: EventEnvelope) => {
      this.logger.info(`Received UserRegistered event for ${event.payload.userId}`);
      const existing = await this.repository.findUserById(event.payload.userId);

      if (!existing) {
        const newUser: UserEntity = {
          userId: event.payload.userId,
          email: event.payload.email,
          fullName: event.payload.fullName,
          avatarUrl: null,
          phoneNumber: null,
          role: event.payload.role || 'CANDIDATE',
          status: 'INACTIVE',
          institutionId: `inst_${event.payload.institutionSlug || 'default'}`,
          accommodations: [],
          metadata: {},
          createdAt: event.timestamp || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await this.repository.createUser(newUser);
      }
    });

    // Listen to EmailVerified events emitted by Auth Service
    this.consumer.subscribe('EmailVerified', async (event: EventEnvelope) => {
      this.logger.info(`Received EmailVerified event for ${event.payload.userId}`);
      const user = await this.repository.findUserById(event.payload.userId);
      if (user) {
        await this.repository.updateUser(user.userId, { status: 'ACTIVE' });
      }
    });
  }
}
