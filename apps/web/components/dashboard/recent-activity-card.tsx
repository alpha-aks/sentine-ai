import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ShieldCheck, UserPlus, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';

interface ActivityItem {
  id: string;
  type: 'REGISTRATION' | 'EXAM_CREATED' | 'VIOLATION_FLAGGED' | 'SYSTEM_EVENT';
  title: string;
  timestamp: string;
  details: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'EXAM_CREATED',
    title: 'New Exam Scheduled',
    timestamp: new Date().toISOString(),
    details: 'CS101 Midterm Examination scheduled for 150 candidates.'
  },
  {
    id: '2',
    type: 'VIOLATION_FLAGGED',
    title: 'Integrity Alert Flagged',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    details: 'Multiple displays detected on Session #sess_8912.'
  },
  {
    id: '3',
    type: 'REGISTRATION',
    title: 'New User Registered',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    details: 'Candidate glitchivy8275@gmail.com registered under inst_itc.'
  },
  {
    id: '4',
    type: 'SYSTEM_EVENT',
    title: 'Audit Policy Sync',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    details: 'Lockdown browser policies synced across 3 institutions.'
  }
];

export function RecentActivityCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">Real-Time Audit Stream</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {mockActivities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3 text-xs">
              <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                {act.type === 'EXAM_CREATED' && <FileSpreadsheet className="h-4 w-4" />}
                {act.type === 'VIOLATION_FLAGGED' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                {act.type === 'REGISTRATION' && <UserPlus className="h-4 w-4" />}
                {act.type === 'SYSTEM_EVENT' && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground truncate">{act.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {formatDateTime(act.timestamp)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5">{act.details}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
