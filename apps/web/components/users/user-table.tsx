'use client';

import React from 'react';
import Link from 'next/link';
import { UserEntity, UserAccountStatus } from '@/types/user';
import { UserAvatar } from './user-avatar';
import { StatusBadge } from './status-badge';
import { ActionMenu } from './action-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

interface UserTableProps {
  users: UserEntity[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onStatusChange: (id: string, status: UserAccountStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAssignRole?: (id: string) => void;
  isLoading?: boolean;
}

const roleBadgeVariant: Record<string, string> = {
  EXAM_ADMIN: 'bg-destructive/10 text-destructive border-destructive/20',
  PROCTOR_SUPERVISOR: 'bg-primary/10 text-primary border-primary/20',
  LIVE_PROCTOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLIANCE_OFFICER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CANDIDATE: 'bg-secondary text-secondary-foreground border-border'
};

export function UserTable({
  users,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onStatusChange,
  onDelete,
  onAssignRole,
  isLoading
}: UserTableProps) {
  const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      onSelectAll(users.map((u) => u.id));
    } else {
      onSelectAll([]);
    }
  };

  return (
    <div className="rounded-md border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="p-4 w-10 text-center">
                <Checkbox checked={allSelected} onCheckedChange={handleSelectAllChange} aria-label="Select all" />
              </th>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Institution Slug</th>
              <th className="p-4">Created Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4 text-center"><div className="h-4 w-4 bg-muted rounded mx-auto" /></td>
                  <td className="p-4"><div className="h-10 w-48 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-6 w-24 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-6 w-20 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  <td className="p-4 text-right"><div className="h-8 w-8 bg-muted rounded ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No users found matching your query filters.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <tr key={user.id} className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(user.id)}
                        aria-label={`Select ${user.fullName}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} role={user.role} />
                        <div>
                          <Link href={`/users/${user.id}`} className="font-semibold text-foreground hover:underline">
                            {user.fullName}
                          </Link>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`font-mono text-xs ${roleBadgeVariant[user.role] || ''}`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="p-4 text-xs font-mono text-muted-foreground">
                      {user.institutionSlug || user.institutionId}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <ActionMenu user={user} onStatusChange={onStatusChange} onDelete={onDelete} onAssignRole={onAssignRole} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
