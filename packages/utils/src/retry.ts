export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffFactor?: number;
  maxDelayMs?: number;
  jitter?: boolean;
  onRetry?: (error: any, attempt: number) => void;
  shouldRetry?: (error: any) => boolean;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelay = options.delayMs ?? 500;
  const backoffFactor = options.backoffFactor ?? 2;
  const maxDelay = options.maxDelayMs ?? 30000;
  const useJitter = options.jitter ?? true;

  let currentDelay = initialDelay;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt > maxRetries) {
        break;
      }
      if (options.shouldRetry && !options.shouldRetry(error)) {
        throw error;
      }
      if (options.onRetry) {
        options.onRetry(error, attempt);
      }

      let sleepDuration = currentDelay;
      if (useJitter) {
        // Full jitter algorithm
        sleepDuration = Math.random() * currentDelay;
      }

      await sleep(sleepDuration);
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}
