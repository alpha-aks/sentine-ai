'use client';

import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Initializing Secure Examination Environment...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
        <ShieldCheck className="h-10 w-10" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-foreground">{message}</h3>
        <p className="text-xs text-muted-foreground">SentinelAI Proctoring Engine Loading</p>
      </div>
      <Loader2 className="h-6 w-6 text-primary animate-spin" />
    </div>
  );
}
