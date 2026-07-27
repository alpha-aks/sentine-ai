export function chunk<T>(array: T[], size: number): T[][] {
  if (!array || size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!array) return [];
  if (!keyFn) return Array.from(new Set(array));

  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  if (!array) return result;
  for (const item of array) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

export function sortBy<T>(array: T[], keyFn: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
  if (!array) return [];
  return [...array].sort((a, b) => {
    const valA = keyFn(a);
    const valB = keyFn(b);

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  if (!array) return [pass, fail];
  for (const item of array) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  return [pass, fail];
}

export function sample<T>(array: T[]): T | undefined {
  if (!array || array.length === 0) return undefined;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

export function shuffle<T>(array: T[]): T[] {
  if (!array) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  if (!arr1 || !arr2) return [];
  const set2 = new Set(arr2);
  return unique(arr1.filter(item => set2.has(item)));
}

export function difference<T>(arr1: T[], arr2: T[]): T[] {
  if (!arr1) return [];
  if (!arr2) return [...arr1];
  const set2 = new Set(arr2);
  return arr1.filter(item => !set2.has(item));
}

export function flatten<T>(array: (T | T[])[]): T[] {
  if (!array) return [];
  return array.reduce<T[]>((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
}
