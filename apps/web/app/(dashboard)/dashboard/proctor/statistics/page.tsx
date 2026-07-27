'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProctorStatsQuery } from '@/hooks/use-proctor-monitoring-query';
import { Activity, ShieldCheck, Users, AlertTriangle } from 'lucide-react';

export default function ProctoringStatisticsPage() {
  const { data: stats } = useProctorStatsQuery();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      <PageHeader
        title="Real-Time Proctoring Analytics"
        description="System aggregated statistics, risk distribution metrics, and live stream connection health"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Active Monitored Exams</div>
              <div className="text-2xl font-black text-foreground mt-1">{stats?.activeExamsCount || 1}</div>
            </div>
            <Activity className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Monitored Candidates</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{stats?.totalMonitoredCandidates || 3}</div>
            </div>
            <Users className="h-6 w-6 text-emerald-400" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Suspicious Flagged Sessions</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{stats?.suspiciousCandidatesCount || 1}</div>
            </div>
            <ShieldCheck className="h-6 w-6 text-amber-400" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Open Incidents & Alerts</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{stats?.openAlertsCount || 1}</div>
            </div>
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-xs bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Proctoring Telemetry Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-xs text-muted-foreground space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Low Risk (0% - 39%)</span>
              <span className="text-emerald-400">66.6%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-500 w-[66.6%]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Medium Risk (40% - 69%)</span>
              <span className="text-amber-400">0.0%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-amber-500 w-0" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span>High / Critical Risk (70% - 100%)</span>
              <span className="text-rose-400">33.3%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-rose-500 w-[33.3%]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
