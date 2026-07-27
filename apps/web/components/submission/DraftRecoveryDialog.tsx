import React from 'react';
import { useSubmissionStore } from '@/store/submission-store';
import { Button } from '@/components/ui/button';
import { RefreshCw, History, ShieldAlert } from 'lucide-react';

interface DraftRecoveryDialogProps {
  uncommittedCount: number;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryDialog({ uncommittedCount, onRestore, onDiscard }: DraftRecoveryDialogProps) {
  const open = useSubmissionStore((s) => s.draftRecoveryDialogOpen);
  const setOpen = useSubmissionStore((s) => s.setDraftRecoveryDialogOpen);

  if (!open || uncommittedCount === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 text-amber-400 font-bold border-b pb-3">
          <History className="h-6 w-6 shrink-0" />
          <span className="text-base">Uncommitted Draft Recovery</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          SentinelAI detected <strong className="text-foreground">{uncommittedCount} autosaved draft response(s)</strong> from a previous session that were not committed to the server.
        </p>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Restoring drafts will overwrite current un-autosaved form inputs with your latest local autosave.</span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onDiscard();
              setOpen(false);
            }}
          >
            Discard Drafts
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onRestore();
              setOpen(false);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Restore {uncommittedCount} Draft(s)
          </Button>
        </div>
      </div>
    </div>
  );
}
