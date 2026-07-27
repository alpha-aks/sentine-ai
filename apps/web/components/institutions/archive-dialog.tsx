'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw } from 'lucide-react';

interface ArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  mode: 'ARCHIVE' | 'RESTORE';
  isLoading?: boolean;
}

export function ArchiveDialog({ open, onOpenChange, onConfirm, mode, isLoading }: ArchiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {mode === 'ARCHIVE' ? <Archive className="h-5 w-5 text-amber-500" /> : <RotateCcw className="h-5 w-5 text-emerald-500" />}
            <DialogTitle>{mode === 'ARCHIVE' ? 'Archive Institution' : 'Restore Institution'}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {mode === 'ARCHIVE'
              ? 'Archiving will suspend active proctoring access while retaining historical candidate transcripts and logs.'
              : 'Restoring will reactivate tenant access and resume active proctoring capabilities.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={mode === 'ARCHIVE' ? 'default' : 'secondary'} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : mode === 'ARCHIVE' ? 'Archive Institution' : 'Restore Active Access'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
