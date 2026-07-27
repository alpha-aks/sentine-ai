import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';

export class AuthEventPublisher {
  private readonly publisher: EventPublisher;
  private readonly logger: Logger;

  constructor(eventBus?: InMemoryEventBus, logger?: Logger) {
    const bus = eventBus || new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'auth-service' });
    this.logger = logger || new Logger({ serviceName: 'auth-service' });
  }

  public async publishUserRegistered(payload: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    institutionSlug: string;
    verificationToken: string;
  }): Promise<void> {
    this.logger.info(`Publishing UserRegistered event for ${payload.userId}`);
    await this.publisher.publish('UserRegistered', payload);
  }

  public async publishUserLoggedIn(payload: {
    userId: string;
    email: string;
    role: string;
    sessionId: string;
    deviceIp: string;
    userAgent: string;
  }): Promise<void> {
    this.logger.info(`Publishing UserLoggedIn event for ${payload.userId}`);
    await this.publisher.publish('UserLoggedIn', payload);
  }

  public async publishUserLoggedOut(payload: {
    userId: string;
    sessionId: string;
  }): Promise<void> {
    this.logger.info(`Publishing UserLoggedOut event for ${payload.userId}`);
    await this.publisher.publish('UserLoggedOut', payload);
  }

  public async publishPasswordChanged(payload: {
    userId: string;
    timestamp: string;
  }): Promise<void> {
    this.logger.info(`Publishing PasswordChanged event for ${payload.userId}`);
    await this.publisher.publish('PasswordChanged', payload);
  }

  public async publishPasswordResetRequested(payload: {
    userId: string;
    email: string;
    resetToken: string;
  }): Promise<void> {
    this.logger.info(`Publishing PasswordResetRequested event for ${payload.userId}`);
    await this.publisher.publish('PasswordResetRequested', payload);
  }

  public async publishEmailVerified(payload: {
    userId: string;
    email: string;
  }): Promise<void> {
    this.logger.info(`Publishing EmailVerified event for ${payload.userId}`);
    await this.publisher.publish('EmailVerified', payload);
  }
}
