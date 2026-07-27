export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

export function formatDurationMs(ms: number): string {
  if (ms < 0) return '0ms';
  if (ms < 1000) return `${Math.floor(ms)}ms`;
  return formatDuration(Math.floor(ms / 1000));
}

export function parseDurationString(str: string): number {
  if (!str || typeof str !== 'string') return 0;
  const regex = /(\d+)\s*(d|h|m|s|ms)/gi;
  let totalSeconds = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'd':
        totalSeconds += value * 86400;
        break;
      case 'h':
        totalSeconds += value * 3600;
        break;
      case 'm':
        totalSeconds += value * 60;
        break;
      case 's':
        totalSeconds += value;
        break;
      case 'ms':
        totalSeconds += value / 1000;
        break;
    }
  }

  return totalSeconds;
}

export function getCurrentTimeSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function getCurrentTimeMs(): number {
  return Date.now();
}

export function formatTimeString(date: Date | string | number = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: "${date}"`);
  }
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
