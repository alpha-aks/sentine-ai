import { LogLevel, LogContext } from './types';

const LEVEL_NUMBERS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m' // Magenta
};

const RESET_COLOR = '\x1b[0m';

export function shouldLog(currentLevel: LogLevel, minLevel: LogLevel): boolean {
  return LEVEL_NUMBERS[currentLevel] >= LEVEL_NUMBERS[minLevel];
}

export function formatJsonLog(
  level: LogLevel,
  message: string,
  context: LogContext,
  extraData?: Record<string, any>
): string {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...context,
    ...extraData
  };
  return JSON.stringify(logEntry);
}

export function formatPrettyLog(
  level: LogLevel,
  message: string,
  context: LogContext,
  extraData?: Record<string, any>
): string {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  const color = LEVEL_COLORS[level] || RESET_COLOR;
  const levelTag = `${color}[${level.toUpperCase()}]${RESET_COLOR}`;

  const service = context.service ? `\x1b[90m(${context.service})\x1b[0m` : '';
  const reqId = context.requestId ? `\x1b[34m[req:${context.requestId}]\x1b[0m` : '';
  const corrId = context.correlationId ? `\x1b[35m[corr:${context.correlationId}]\x1b[0m` : '';
  const sessId = context.sessionId ? `\x1b[33m[sess:${context.sessionId}]\x1b[0m` : '';

  const metaStr = [service, reqId, corrId, sessId].filter(Boolean).join(' ');

  let output = `${time} ${levelTag} ${metaStr} ${message}`;

  const remainingContext = { ...context };
  delete remainingContext.service;
  delete remainingContext.requestId;
  delete remainingContext.correlationId;
  delete remainingContext.sessionId;

  const combinedData = { ...remainingContext, ...extraData };
  if (Object.keys(combinedData).length > 0) {
    output += `\n  \x1b[90m${JSON.stringify(combinedData)}\x1b[0m`;
  }

  return output;
}
