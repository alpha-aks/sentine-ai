'use client';

import * as React from 'react';
import { useNotificationStore } from '@/store/notification-store';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
            n.type === 'success' && 'border-emerald-500/20 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
            n.type === 'error' && 'border-rose-500/20 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100',
            n.type === 'warning' && 'border-amber-500/20 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
            n.type === 'info' && 'border-sky-500/20 bg-sky-50 text-sky-900 dark:bg-sky-950 dark:text-sky-100'
          )}
        >
          {n.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          {n.type === 'error' && <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />}
          {n.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />}
          {n.type === 'info' && <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />}

          <div className="flex-1">
            <h4 className="text-sm font-semibold">{n.title}</h4>
            {n.message && <p className="text-xs opacity-90">{n.message}</p>}
          </div>

          <button
            onClick={() => removeNotification(n.id)}
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
