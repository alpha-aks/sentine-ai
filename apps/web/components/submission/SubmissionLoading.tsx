import React from 'react';
import { Shield, Loader2 } from 'lucide-react';

export function SubmissionLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
      <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center animate-pulse">
        <Shield className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Initializing Candidate Submission Workspace...</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Connecting to SentinelAI Submission Service & restoring response state.
      </p>
    </div>
  );
}
