export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  maxAttempts?: number;
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${errorMessage} after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function poll<T>(
  fn: () => Promise<T | null | undefined>,
  options: PollOptions = {}
): Promise<T> {
  const interval = options.intervalMs ?? 1000;
  const timeout = options.timeoutMs ?? 30000;
  const maxAttempts = options.maxAttempts ?? Infinity;

  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < timeout && attempts < maxAttempts) {
    attempts++;
    const result = await fn();
    if (result !== null && result !== undefined) {
      return result;
    }
    await new Promise(r => setTimeout(r, interval));
  }

  throw new Error(`Polling timed out after ${attempts} attempts`);
}

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (!items || items.length === 0) return [];
  const limit = Math.max(1, concurrency);
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const worker = async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await fn(items[index], index);
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);

  return results;
}
