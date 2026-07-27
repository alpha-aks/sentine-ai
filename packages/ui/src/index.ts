import React from 'react';
import { AlertLevel } from '@sentinel-ai/types';

export function getRiskLevelColor(score: number): string {
  if (score >= 0.85) return '#DA3633'; // Red (Critical)
  if (score >= 0.7) return '#DB6D28'; // Orange (High)
  if (score >= 0.4) return '#D29922'; // Yellow (Medium)
  return '#238636'; // Green (Low)
}

export function getAlertBadgeClass(level: AlertLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-900/80 text-red-200 border-red-600';
    case 'HIGH':
      return 'bg-orange-900/80 text-orange-200 border-orange-600';
    case 'MEDIUM':
      return 'bg-yellow-900/80 text-yellow-200 border-yellow-600';
    case 'LOW':
      return 'bg-blue-900/80 text-blue-200 border-blue-600';
    default:
      return 'bg-green-900/80 text-green-200 border-green-600';
  }
}

export function formatTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return isoString;
  }
}
