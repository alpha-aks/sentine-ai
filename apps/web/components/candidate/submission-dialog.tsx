'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface SubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  answeredCount: number;
  markedCount: number;
  onConfirmSubmit: () => Promise<void>;
  isSubmitting?: boolean;
}

export function SubmissionDialog({
  open,
  onOpenChange,
  totalQuestions,
  answeredCount,
  markedCount,
  onConfirmSubmit,
  isSubmitting
}: SubmissionDialogProps) {
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Confirm Final Exam Submission
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to finalize and submit your examination? Once submitted, you cannot change your responses.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-md bg-muted/40 border space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Questions:</span>
            <span className="font-mono font-semibold">{totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Answered:</span>
            <span className="font-mono font-semibold text-emerald-400">{answeredCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unanswered:</span>
            <span className="font-mono font-semibold text-destructive">{unansweredCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marked for Review:</span>
            <span className="font-mono font-semibold text-amber-400">{markedCount}</span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Continue Test
          </Button>
          <Button variant="destructive" onClick={onConfirmSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Confirm & Finalize Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
