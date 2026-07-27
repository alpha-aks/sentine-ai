'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionMatrix } from '@/components/permissions/permission-matrix';
import { SYSTEM_PERMISSIONS } from '@/services/permission.service';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function PermissionsPage() {
  const [allPermissions] = useState<string[]>(SYSTEM_PERMISSIONS.map((p) => p.code));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Permissions Catalog"
        description="Inspect system-wide RBAC permission identifiers and operational scopes"
      />

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 flex items-start gap-3 text-sm">
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-muted-foreground">
            This catalog lists all available granular permissions enforced by SentinelAI microservices. Roles are assigned a combination of these permissions to grant fine-grained access.
          </p>
        </CardContent>
      </Card>

      <PermissionMatrix selectedPermissions={allPermissions} onChange={() => {}} disabled />
    </div>
  );
}
