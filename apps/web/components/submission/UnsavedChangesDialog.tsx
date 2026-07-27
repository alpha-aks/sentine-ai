import React from 'react';
import { useSubmissionStore } from '@/store/submission-store';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesDialogProps {
  onConfirmLeave: () => void;
  onSaveAndLeave: () => void;
}

export function UnsavedChangesDialog({ onConfirmLeave, onSaveAndLeave }: UnsavedChangesDialogProps) {
  const open = useSubmissionStore((s) => s.unsavedChangesDialogOpen);
  const setOpen = useSubmissionStore((s) => s.setUnsavedChangesDialogOpen);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 text-rose-400 font-bold border-b pb-3">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <span className="text-base">Unsaved Answers Pending</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          You have un-autosaved changes on the active question. Leaving this question before autosave completes may result in temporary draft loss.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen(false);
              onConfirmLeave();
            }}
          >
            Leave Without Saving
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setOpen(false);
              onSaveAndLeave();
            }}
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
