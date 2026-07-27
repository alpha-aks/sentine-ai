import { Logger } from './logger';
import { LoggerOptions, LogContext } from './types';

export * from './types';
export * from './logger';
export * from './formatters';

export function createLogger(
  serviceName: string,
  baseContext: LogContext = {},
  options?: Partial<LoggerOptions>
): Logger {
  return new Logger(
    {
      serviceName,
      isProduction: process.env.NODE_ENV === 'production',
      ...options
    },
    baseContext
  );
}

export const logger = createLogger('SentinelAI');
