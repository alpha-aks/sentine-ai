import React from 'react';
import { RefreshCw, VideoOff } from 'lucide-react';

interface CameraReconnectDialogProps {
  isOpen: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function CameraReconnectDialog({ isOpen, onRetry, onClose }: CameraReconnectDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center gap-3 text-rose-400 font-bold text-base">
          <div className="h-9 w-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
            <VideoOff className="h-5 w-5 text-rose-400" />
          </div>
          <span>Camera Connection Dropped</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The candidate camera stream was interrupted. Vision Guard AI requires an active webcam feed to maintain exam compliance.
        </p>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-semibold text-xs transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onRetry}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reconnect Stream</span>
          </button>
        </div>
      </div>
    </div>
  );
}
