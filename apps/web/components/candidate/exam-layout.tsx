'use client';

import React from 'react';
import { ViolationBanner } from './violation-banner';
import { FullscreenBanner } from './fullscreen-banner';

interface ExamLayoutProps {
  children: React.ReactNode;
}

export function ExamLayout({ children }: ExamLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      <ViolationBanner />
      <FullscreenBanner />
      <main className="flex-1 flex">{children}</main>
    </div>
  );
}
