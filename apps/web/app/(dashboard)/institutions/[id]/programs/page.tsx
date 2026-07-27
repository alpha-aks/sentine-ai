'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { GraduationCap } from 'lucide-react';

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academic Programs" description="Degree tracks, diploma curricula, and certification frameworks" />
      <EmptyState
        icon={<GraduationCap className="h-10 w-10 text-muted-foreground" />}
        title="No Academic Programs Configured"
        description="Create degree programs to associate courses and candidate cohorts."
        actionLabel="Add Program Track"
        onAction={() => {}}
      />
    </div>
  );
}
