'use client';

import React, { useEffect } from 'react';
import { useCandidateStore } from '@/store/candidate-store';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const { isOnline, setIsOnline } = useCandidateStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isOnline
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-destructive/10 border-destructive/30 text-destructive animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Reconnecting...</span>
        </>
      )}
    </div>
  );
}
