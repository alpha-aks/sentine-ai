'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="User Profile" description="Manage personal details, accommodations, and security credentials" />
    </div>
  );
}
