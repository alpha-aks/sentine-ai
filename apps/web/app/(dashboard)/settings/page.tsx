'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure platform parameters and tenant policies" />
    </div>
  );
}
