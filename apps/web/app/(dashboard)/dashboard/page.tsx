'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { SystemHealthCard } from '@/components/dashboard/system-health-card';
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { SimpleAreaChart, SimpleBarChart } from '@/components/ui/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, FileSpreadsheet, Activity, HelpCircle, PlusCircle, ShieldAlert } from 'lucide-react';

const examActivityData = [
  { day: 'Mon', active: 12, completed: 45 },
  { day: 'Tue', active: 18, completed: 52 },
  { day: 'Wed', active: 25, completed: 60 },
  { day: 'Thu', active: 30, completed: 78 },
  { day: 'Fri', active: 22, completed: 85 },
  { day: 'Sat', active: 8, completed: 30 },
  { day: 'Sun', active: 5, completed: 15 }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="Real-time multi-tenant operational summary & exam integrity overview"
      />

      {/* High-Density Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Institutions"
          value="12"
          description="Active tenant institutions"
          icon={<Building2 className="h-5 w-5" />}
          trend={{ value: '100% Active', direction: 'up' }}
        />

        <StatsCard
          title="Active Users"
          value="1,248"
          description="Candidates & proctors online"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: '12% increase', direction: 'up' }}
        />

        <StatsCard
          title="Scheduled Exams"
          value="48"
          description="Upcoming in next 7 days"
          icon={<FileSpreadsheet className="h-5 w-5" />}
          trend={{ value: '8 today', direction: 'neutral' }}
        />

        <StatsCard
          title="Active Exams"
          value="14"
          description="Live proctored exams"
          icon={<Activity className="h-5 w-5" />}
          trend={{ value: '3 flagged', direction: 'down' }}
        />

        <StatsCard
          title="Candidate Sessions"
          value="342"
          description="Concurrent lockdown sessions"
          icon={<HelpCircle className="h-5 w-5" />}
          trend={{ value: '99.4% Integrity', direction: 'up' }}
        />
      </div>

      {/* Quick Action Cards Grid */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Schedule New Exam"
            description="Configure exam rules, duration, passing percentage, and candidate roster."
            href="/exams"
            icon={<PlusCircle className="h-5 w-5" />}
          />
          <QuickActionCard
            title="Create Questions"
            description="Add multiple choice, essay, or coding test questions to the question bank."
            href="/questions"
            icon={<HelpCircle className="h-5 w-5" />}
          />
          <QuickActionCard
            title="User Directory"
            description="Manage platform candidate accounts, proctor roles, and permissions."
            href="/users"
            icon={<Users className="h-5 w-5" />}
          />
          <QuickActionCard
            title="Audit Compliance Logs"
            description="Review post-exam proctoring violation logs and integrity reports."
            href="/reports"
            icon={<ShieldAlert className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Daily Completed Exam Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={examActivityData} xKey="day" yKey="completed" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Concurrent Active Proctoring Load</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleAreaChart data={examActivityData} xKey="day" yKey="active" />
          </CardContent>
        </Card>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <SystemHealthCard />
        <RecentActivityCard />
      </div>
    </div>
  );
}
