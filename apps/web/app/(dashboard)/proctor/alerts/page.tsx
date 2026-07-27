'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { AlertPanel } from '@/components/proctor/AlertPanel';
import { useAlertsQuery } from '@/hooks/use-proctor-monitoring-query';
import { useProctorStore } from '@/store/proctor-store';
import { Filter } from 'lucide-react';

export default function IncidentAlertCenterPage() {
  const alertStatusFilter = useProctorStore((s) => s.alertStatusFilter);
  const setAlertStatusFilter = useProctorStore((s) => s.setAlertStatusFilter);

  const { data: alerts = [] } = useAlertsQuery(undefined, alertStatusFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Incident Alert Center"
          description="Enterprise proctoring incident log, priority alert triage, escalation, and resolution workflow"
        />

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex bg-card p-1 rounded-lg border text-xs shadow-xs">
            {['ALL', 'OPEN', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setAlertStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  alertStatusFilter === st ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AlertPanel alerts={alerts} />
    </div>
  );
}
