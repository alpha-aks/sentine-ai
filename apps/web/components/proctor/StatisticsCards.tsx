'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface StatisticsCardsProps {
  activeExamsCount?: number;
  totalMonitoredCandidates?: number;
  suspiciousCandidatesCount?: number;
  openAlertsCount?: number;
}

export function StatisticsCards({
  activeExamsCount = 1,
  totalMonitoredCandidates = 3,
  suspiciousCandidatesCount = 1,
  openAlertsCount = 1
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card className="border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Active Exams</div>
            <div className="text-2xl font-black text-foreground mt-1">{activeExamsCount}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">Live Monitoring</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Monitored Candidates</div>
            <div className="text-2xl font-black text-foreground mt-1">{totalMonitoredCandidates}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">Active Stream</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Suspicious Flagged</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{suspiciousCandidatesCount}</div>
            <div className="text-[11px] text-amber-400 mt-0.5 font-medium">Risk Score ≥ 70%</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Open Incident Alerts</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{openAlertsCount}</div>
            <div className="text-[11px] text-rose-400 mt-0.5 font-medium">Requires Review</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
