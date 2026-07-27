'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academic Calendar & Term Schedules" description="Configure exam windows, term dates, and institutional blackout periods" />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Active Assessment Period</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-foreground">Fall Semester Midterm Examination Window</p>
              <p className="text-xs text-muted-foreground mt-0.5">October 15, 2026 – November 05, 2026</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <Clock className="h-3 w-3" /> ACTIVE WINDOW
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
