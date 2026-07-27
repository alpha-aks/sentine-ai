'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { ThemeSwitch } from '@/components/dashboard/theme-switch';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground select-none">
      {/* Lockdown Minimal Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-card px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">SentinelAI Secure Lockdown Environment</span>
        </div>
        <ThemeSwitch />
      </header>

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
