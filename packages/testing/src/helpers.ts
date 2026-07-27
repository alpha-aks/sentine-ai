import { sleep } from '@sentinel-ai/utils';

export async function waitForCondition(
  predicate: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 50
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const matched = await predicate();
    if (matched) return;
    await sleep(intervalMs);
  }

  throw new Error(
    `waitForCondition timed out after ${timeoutMs}ms without condition becoming true.`
  );
}

export async function expectToThrow(
  fn: () => Promise<any> | any,
  expectedMessage?: string | RegExp
): Promise<any> {
  let thrownError: any = null;
  try {
    await fn();
  } catch (err) {
    thrownError = err;
  }

  if (!thrownError) {
    throw new Error('Expected function to throw an error, but it resolved successfully.');
  }

  if (expectedMessage) {
    const msg = thrownError instanceof Error ? thrownError.message : String(thrownError);
    if (typeof expectedMessage === 'string') {
      if (!msg.includes(expectedMessage)) {
        throw new Error(
          `Expected error message to contain "${expectedMessage}", but got "${msg}".`
        );
      }
    } else if (expectedMessage instanceof RegExp) {
      if (!expectedMessage.test(msg)) {
        throw new Error(
          `Expected error message to match regex ${expectedMessage}, but got "${msg}".`
        );
      }
    }
  }

  return thrownError;
}

export function flushPromises(): Promise<void> {
  return new Promise(resolve => (setImmediate ? setImmediate(resolve) : setTimeout(resolve, 0)));
}

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
