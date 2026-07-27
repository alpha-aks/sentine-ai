# Admin Dashboard Layout Guide

All dashboard sub-routes inherit from [`DashboardLayout`](file:///c:/Users/tanis/OneDrive/Desktop/mini/apps/web/app/(dashboard)/layout.tsx) under `app/(dashboard)/`.

---

## Page Template Structure

```tsx
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FeaturePage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Management"
        description="Configure feature parameters and rules"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Create Resource
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
      </div>

      {/* Feature Content / Table */}
    </div>
  );
}
```
