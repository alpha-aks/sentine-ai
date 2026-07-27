'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Users2 } from 'lucide-react';

export default function BatchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Student Cohorts & Batches" description="Group candidate rosters into academic terms and exam batches" />
      <EmptyState
        icon={<Users2 className="h-10 w-10 text-muted-foreground" />}
        title="No Cohort Batches Created"
        description="Organize candidate groups into exam batches for bulk proctoring assignments."
        actionLabel="Create Cohort Batch"
        onAction={() => {}}
      />
    </div>
  );
}
