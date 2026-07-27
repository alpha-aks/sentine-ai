'use client';

import React from 'react';
import Link from 'next/link';
import { RoleEntity } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Copy, Trash2, Edit3, Users } from 'lucide-react';

interface RoleTableProps {
  roles: RoleEntity[];
  onClone: (roleId: string) => Promise<void>;
  onDelete: (roleId: string) => Promise<void>;
}

export function RoleTable({ roles, onClone, onDelete }: RoleTableProps) {
  return (
    <div className="rounded-md border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="p-4">Role Name & Description</th>
              <th className="p-4">System Tag</th>
              <th className="p-4">Assigned Users</th>
              <th className="p-4">Granted Permissions</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-muted/40 transition-colors">
                <td className="p-4">
                  <div>
                    <Link href={`/roles/${role.id}`} className="font-semibold text-foreground hover:underline flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" /> {role.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-md">{role.description}</p>
                  </div>
                </td>
                <td className="p-4">
                  {role.isSystem ? (
                    <Badge variant="secondary" className="text-xs font-mono">
                      SYSTEM ROLE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-mono text-primary border-primary/30">
                      CUSTOM ROLE
                    </Badge>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{role.userCount} users</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="text-xs">
                    {role.permissions.length} Permissions
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onClone(role.id)} title="Clone role permissions">
                      <Copy className="h-4 w-4 mr-1" /> Clone
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/roles/${role.id}`}>
                        <Edit3 className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                    {!role.isSystem && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(role.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
