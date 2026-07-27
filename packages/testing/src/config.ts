export interface TestConfigOptions {
  env?: 'test' | 'development' | 'production';
  apiBaseUrl?: string;
  wsBaseUrl?: string;
  jwtSecret?: string;
  timeoutMs?: number;
  mockDelayMs?: number;
  enableLogging?: boolean;
}

export const DEFAULT_TEST_CONFIG: Required<TestConfigOptions> = {
  env: 'test',
  apiBaseUrl: 'http://localhost:4000/api/v1',
  wsBaseUrl: 'ws://localhost:4000/ws',
  jwtSecret: 'test_jwt_secret_key_1234567890_sentinel_ai',
  timeoutMs: 5000,
  mockDelayMs: 0,
  enableLogging: false
};

export class TestConfig {
  private static instance: TestConfigOptions = { ...DEFAULT_TEST_CONFIG };

  public static get(): Required<TestConfigOptions> {
    return { ...DEFAULT_TEST_CONFIG, ...this.instance };
  }

  public static configure(overrides: TestConfigOptions): void {
    this.instance = { ...this.instance, ...overrides };
  }

  public static reset(): void {
    this.instance = { ...DEFAULT_TEST_CONFIG };
  }
}
