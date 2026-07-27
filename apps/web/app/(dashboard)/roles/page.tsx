'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { RoleTable } from '@/components/roles/role-table';
import { RoleEntity } from '@/types/user';
import { roleService } from '@/services/role.service';
import { ShieldPlus, RefreshCw } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleEntity[]>([]);

  const fetchRoles = async () => {
    try {
      const items = await roleService.getRoles();
      setRoles(items);
    } catch {
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleClone = async (roleId: string) => {
    const name = prompt('Enter a name for the cloned role:');
    if (!name) return;
    await roleService.cloneRole(roleId, name);
    fetchRoles();
  };

  const handleDelete = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this custom role?')) {
      await roleService.deleteRole(roleId);
      fetchRoles();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description="Configure system access control roles, permission scopes, and functional responsibilities"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRoles}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/roles/new">
                <ShieldPlus className="mr-2 h-4 w-4" /> Create Custom Role
              </Link>
            </Button>
          </div>
        }
      />

      <RoleTable roles={roles} onClone={handleClone} onDelete={handleDelete} />
    </div>
  );
}
