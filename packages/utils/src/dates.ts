export function formatIsoTimestamp(date: Date | string | number = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: "${date}"`);
  }
  return d.toISOString();
}

export function parseIsoDate(isoString: string): Date {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid ISO date string: "${isoString}"`);
  }
  return d;
}

export function addMinutes(date: Date | string, minutes: number): Date {
  const d = typeof date === 'string' ? parseIsoDate(date) : new Date(date);
  const result = new Date(d);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export function addHours(date: Date | string, hours: number): Date {
  const d = typeof date === 'string' ? parseIsoDate(date) : new Date(date);
  const result = new Date(d);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? parseIsoDate(date) : new Date(date);
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date | string, days: number): Date {
  return addDays(date, -days);
}

export function diffInSeconds(start: Date | string, end: Date | string = new Date()): number {
  const startDate = typeof start === 'string' ? parseIsoDate(start) : start;
  const endDate = typeof end === 'string' ? parseIsoDate(end) : end;
  return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
}

export function diffInMinutes(start: Date | string, end: Date | string = new Date()): number {
  return Math.floor(diffInSeconds(start, end) / 60);
}

export function isBefore(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseIsoDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseIsoDate(date2) : date2;
  return d1.getTime() < d2.getTime();
}

export function isAfter(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseIsoDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseIsoDate(date2) : date2;
  return d1.getTime() > d2.getTime();
}

export function isBetween(
  target: Date | string,
  start: Date | string,
  end: Date | string
): boolean {
  const t = typeof target === 'string' ? parseIsoDate(target) : target;
  const s = typeof start === 'string' ? parseIsoDate(start) : start;
  const e = typeof end === 'string' ? parseIsoDate(end) : end;
  return t.getTime() >= s.getTime() && t.getTime() <= e.getTime();
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseIsoDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseIsoDate(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function startOfDay(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? parseIsoDate(date) : new Date(date);
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? parseIsoDate(date) : new Date(date);
  const result = new Date(d);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function formatRelativeTime(
  date: Date | string,
  baseDate: Date | string = new Date()
): string {
  const target = typeof date === 'string' ? parseIsoDate(date) : date;
  const base = typeof baseDate === 'string' ? parseIsoDate(baseDate) : baseDate;
  const diffSec = Math.floor((base.getTime() - target.getTime()) / 1000);
  const isPast = diffSec >= 0;
  const absSec = Math.abs(diffSec);

  if (absSec < 5) return 'just now';

  const units: Array<[string, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1]
  ];

  for (const [unit, secondsInUnit] of units) {
    if (absSec >= secondsInUnit) {
      const count = Math.floor(absSec / secondsInUnit);
      const plural = count === 1 ? '' : 's';
      return isPast ? `${count} ${unit}${plural} ago` : `in ${count} ${unit}${plural}`;
    }
  }

  return 'just now';
}
