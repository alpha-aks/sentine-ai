import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import { UserEntity, UserPreferenceEntity } from '../types/user';

export class UserEventPublisher {
  private readonly publisher: EventPublisher;
  private readonly logger: Logger;

  constructor(eventBus?: InMemoryEventBus, logger?: Logger) {
    const bus = eventBus || new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'user-service' });
    this.logger = logger || new Logger({ serviceName: 'user-service' });
  }

  public async publishUserCreated(user: UserEntity): Promise<void> {
    this.logger.info(`Publishing UserCreated event for ${user.userId}`);
    await this.publisher.publish('UserCreated', {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      institutionId: user.institutionId,
      status: user.status
    });
  }

  public async publishUserUpdated(user: UserEntity): Promise<void> {
    this.logger.info(`Publishing UserUpdated event for ${user.userId}`);
    await this.publisher.publish('UserUpdated', {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status
    });
  }

  public async publishUserDeleted(userId: string): Promise<void> {
    this.logger.info(`Publishing UserDeleted event for ${userId}`);
    await this.publisher.publish('UserDeleted', { userId });
  }

  public async publishUserRoleChanged(payload: {
    userId: string;
    oldRole: string;
    newRole: string;
    assignedBy: string;
    reason?: string;
  }): Promise<void> {
    this.logger.info(`Publishing UserRoleChanged event for ${payload.userId}`);
    await this.publisher.publish('UserRoleChanged', payload);
  }

  public async publishUserPreferenceChanged(
    userId: string,
    preferences: UserPreferenceEntity
  ): Promise<void> {
    this.logger.info(`Publishing UserPreferenceChanged event for ${userId}`);
    await this.publisher.publish('UserPreferenceChanged', {
      userId,
      preferences
    });
  }

  public async publishUserActivated(userId: string): Promise<void> {
    this.logger.info(`Publishing UserActivated event for ${userId}`);
    await this.publisher.publish('UserActivated', { userId });
  }

  public async publishUserDeactivated(userId: string): Promise<void> {
    this.logger.info(`Publishing UserDeactivated event for ${userId}`);
    await this.publisher.publish('UserDeactivated', { userId });
  }
}
