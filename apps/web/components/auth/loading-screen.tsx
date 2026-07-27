import * as React from 'react';
import { Shield, Loader2 } from 'lucide-react';

export function LoadingScreen({ text = 'Initializing SentinelAI...' }: { text?: string }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg mb-4">
        <Shield className="h-7 w-7" />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground" suppressHydrationWarning>
        <Loader2 className="h-4 w-4 animate-spin text-primary" suppressHydrationWarning />
        <span>{text}</span>
      </div>
    </div>
  );
}
