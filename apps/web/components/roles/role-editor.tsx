'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionMatrix } from '../permissions/permission-matrix';
import { RoleEntity } from '@/types/user';
import { Save, Shield, Loader2 } from 'lucide-react';

interface RoleEditorProps {
  role?: RoleEntity | null;
  onSubmit: (data: { name: string; description: string; permissions: string[] }) => Promise<void>;
  isLoading?: boolean;
}

export function RoleEditor({ role, onSubmit, isLoading }: RoleEditorProps) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onSubmit({ name, description, permissions: selectedPermissions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Role Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name *</Label>
            <Input id="role-name" placeholder="Custom Department Manager" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea id="role-desc" placeholder="Scope and operational responsibilities for this role..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Granted System Permissions ({selectedPermissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionMatrix selectedPermissions={selectedPermissions} onChange={setSelectedPermissions} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {role ? 'Update Role Definition' : 'Create Custom Role'}
        </Button>
      </div>
    </form>
  );
}
