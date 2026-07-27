'use client';

import React from 'react';
import { useCandidateStore } from '@/store/candidate-store';
import { Button } from '@/components/ui/button';
import { Maximize2, ShieldAlert } from 'lucide-react';

export function FullscreenBanner() {
  const { isFullscreen, setIsFullscreen } = useCandidateStore();

  const handleRequestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      setIsFullscreen(true);
    }
  };

  if (isFullscreen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 rounded-full bg-destructive/10 border border-destructive/30 text-destructive">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Fullscreen Required for Examination Security</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        SentinelAI Proctoring enforcement policy requires full-screen focus. Exiting fullscreen mode logs security violations.
      </p>
      <Button onClick={handleRequestFullscreen} size="lg" className="px-8 font-semibold">
        <Maximize2 className="mr-2 h-4 w-4" /> Re-Enter Fullscreen Mode
      </Button>
    </div>
  );
}
