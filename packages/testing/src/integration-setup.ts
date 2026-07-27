import { EventConsumer, EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { signJwtToken } from '@sentinel-ai/security';
import { UserRole } from '@sentinel-ai/types';
import { generateUuid } from '@sentinel-ai/utils';
import { DEFAULT_TEST_CONFIG, TestConfigOptions } from './config';
import { MockHttpClient, MockLogger } from './mocks';

export interface IntegrationHarnessContext {
  mockHttp: MockHttpClient;
  mockLogger: MockLogger;
  eventBus: InMemoryEventBus;
  publisher: EventPublisher;
  consumer: EventConsumer;
  generateAuthToken: (role?: UserRole, userId?: string, institutionId?: string) => string;
}

export class TestIntegrationHarness {
  public mockHttp: MockHttpClient;
  public mockLogger: MockLogger;
  public eventBus: InMemoryEventBus;
  public publisher: EventPublisher;
  public consumer: EventConsumer;
  private readonly config: Required<TestConfigOptions>;

  constructor(options?: TestConfigOptions) {
    this.config = { ...DEFAULT_TEST_CONFIG, ...options };
    this.mockHttp = new MockHttpClient();
    this.mockLogger = new MockLogger();
    this.eventBus = new InMemoryEventBus();
    this.publisher = new EventPublisher(this.eventBus, { sourceName: 'test-harness' });
    this.consumer = new EventConsumer(this.eventBus, { defaultMaxRetries: 2 });
  }

  public generateAuthToken(
    role: UserRole = 'EXAM_ADMIN',
    userId: string = generateUuid(),
    institutionId: string = 'inst_mit_001'
  ): string {
    return signJwtToken(
      {
        sub: userId,
        role,
        institutionId,
        iss: 'sentinel-ai-test-harness'
      },
      this.config.jwtSecret,
      3600
    );
  }

  public reset(): void {
    this.mockHttp.clearCalls();
    this.mockLogger.clear();
    this.eventBus.clear();
  }

  public getContext(): IntegrationHarnessContext {
    return {
      mockHttp: this.mockHttp,
      mockLogger: this.mockLogger,
      eventBus: this.eventBus,
      publisher: this.publisher,
      consumer: this.consumer,
      generateAuthToken: this.generateAuthToken.bind(this)
    };
  }
}

export function createIntegrationHarness(options?: TestConfigOptions): TestIntegrationHarness {
  return new TestIntegrationHarness(options);
}
