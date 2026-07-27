import { LogLevel, LogContext, AILogPayload, AuditLogPayload, LoggerOptions } from './types';
import { shouldLog, formatJsonLog, formatPrettyLog } from './formatters';

export class Logger {
  private serviceName: string;
  private isProduction: boolean;
  private minLevel: LogLevel;
  private baseContext: LogContext;

  constructor(options: LoggerOptions, baseContext: LogContext = {}) {
    this.serviceName = options.serviceName;
    this.isProduction = options.isProduction ?? process.env.NODE_ENV === 'production';
    this.minLevel = options.minLevel ?? (this.isProduction ? 'info' : 'debug');
    this.baseContext = {
      service: this.serviceName,
      ...baseContext
    };
  }

  public child(childContext: LogContext): Logger {
    return new Logger(
      {
        serviceName: this.serviceName,
        isProduction: this.isProduction,
        minLevel: this.minLevel
      },
      {
        ...this.baseContext,
        ...childContext
      }
    );
  }

  public withCorrelation(correlationId: string, requestId?: string): Logger {
    return this.child({ correlationId, requestId });
  }

  private write(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    extraData?: Record<string, any>
  ): void {
    if (!shouldLog(level, this.minLevel)) return;

    const mergedContext = {
      ...this.baseContext,
      ...context
    };

    const formatted = this.isProduction
      ? formatJsonLog(level, message, mergedContext, extraData)
      : formatPrettyLog(level, message, mergedContext, extraData);

    if (level === 'error' || level === 'fatal') {
      process.stderr.write(formatted + '\n');
    } else {
      process.stdout.write(formatted + '\n');
    }
  }

  public debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  public error(messageOrError: string | Error, context?: LogContext): void {
    if (messageOrError instanceof Error) {
      this.write('error', messageOrError.message, context, {
        errorName: messageOrError.name,
        stack: messageOrError.stack
      });
    } else {
      this.write('error', messageOrError, context);
    }
  }

  public fatal(messageOrError: string | Error, context?: LogContext): void {
    if (messageOrError instanceof Error) {
      this.write('fatal', messageOrError.message, context, {
        errorName: messageOrError.name,
        stack: messageOrError.stack
      });
    } else {
      this.write('fatal', messageOrError, context);
    }
  }

  public ai(agentId: string, message: string, payload: AILogPayload, context?: LogContext): void {
    this.write('info', `[AI:${agentId}] ${message}`, context, {
      logType: 'AI_AGENT_EVENT',
      ...payload
    });
  }

  public audit(
    action: string,
    message: string,
    payload: AuditLogPayload,
    context?: LogContext
  ): void {
    this.write('info', `[AUDIT:${action}] ${message}`, context, {
      logType: 'SECURITY_AUDIT_EVENT',
      ...payload
    });
  }
}
