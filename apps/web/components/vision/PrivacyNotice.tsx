import React from 'react';
import { ShieldCheck, Video, Mic, Lock } from 'lucide-react';

export function PrivacyNotice() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-3 text-xs">
      <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>Candidate Privacy & Security Disclaimer</span>
      </div>

      <p className="text-muted-foreground leading-relaxed">
        Webcam streams are analyzed strictly for exam proctoring and multi-agent AI verification.
        Frame ingestion vectors are processed transiently with encrypted transit security protocols.
      </p>

      <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-1 border-t border-border">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <Video className="h-3.5 w-3.5" />
          <span>Camera Monitoring Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <Mic className="h-3.5 w-3.5" />
          <span>Acoustic Telemetry Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
}
