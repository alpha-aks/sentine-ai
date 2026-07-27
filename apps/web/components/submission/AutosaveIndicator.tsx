import React from 'react';
import { useSubmissionStore } from '@/store/submission-store';
import { Loader2, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';

export function AutosaveIndicator() {
  const saveStatus = useSubmissionStore((s) => s.saveStatus);
  const lastSavedAt = useSubmissionStore((s) => s.lastSavedAt);
  const isOffline = useSubmissionStore((s) => s.isOffline);

  if (isOffline || saveStatus === 'offline') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Offline — Saving Locally</span>
      </div>
    );
  }

  if (saveStatus === 'saving') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Autosaving draft...</span>
      </div>
    );
  }

  if (saveStatus === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Autosave Error (Retrying...)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span>Saved {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : 'Just now'}</span>
    </div>
  );
}
