'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useManualActionMutation } from '@/hooks/use-proctor-monitoring-query';
import { AlertTriangle, Pause, Play, Octagon, MessageSquare, Flag, RefreshCw } from 'lucide-react';
import { ManualActionType } from '@/services/proctor-monitoring.service';

interface ManualActionPanelProps {
  sessionId: string;
  candidateStatus: string;
  isFlagged?: boolean;
}

export function ManualActionPanel({ sessionId, candidateStatus, isFlagged }: ManualActionPanelProps) {
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const actionMutation = useManualActionMutation();

  const handleAction = async (actionType: ManualActionType) => {
    try {
      setActionSuccess(null);
      await actionMutation.mutateAsync({
        sessionId,
        actionType,
        notes: notes || undefined
      });
      setNotes('');
      setActionSuccess(`Successfully executed action: ${actionType}`);
    } catch {
      // Error handled by query mutation
    }
  };

  return (
    <div className="space-y-4">
      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          {actionSuccess}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Proctor Note / Reason:</label>
        <Input
          placeholder="Optional proctor audit note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction('WARN_CANDIDATE')}
          disabled={actionMutation.isPending}
          className="justify-start border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        >
          <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Warn Candidate
        </Button>

        {candidateStatus === 'PAUSED' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('RESUME_SESSION')}
            disabled={actionMutation.isPending}
            className="justify-start border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Play className="mr-1.5 h-3.5 w-3.5" /> Resume Session
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('PAUSE_SESSION')}
            disabled={actionMutation.isPending || candidateStatus === 'SUBMITTED'}
            className="justify-start border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause Session
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction('FLAG_SUBMISSION')}
          disabled={actionMutation.isPending || isFlagged}
          className="justify-start border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
        >
          <Flag className="mr-1.5 h-3.5 w-3.5" /> Flag Submission
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction('REQUEST_IDENTITY_CHECK')}
          disabled={actionMutation.isPending}
          className="justify-start text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-Check Identity
        </Button>
      </div>

      <div className="pt-2 border-t">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleAction('TERMINATE_SESSION')}
          disabled={actionMutation.isPending || candidateStatus === 'TERMINATED'}
          className="w-full font-bold"
        >
          <Octagon className="mr-1.5 h-4 w-4" /> Terminate Candidate Session
        </Button>
      </div>
    </div>
  );
}
