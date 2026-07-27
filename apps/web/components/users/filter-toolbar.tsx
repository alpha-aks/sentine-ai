'use client';

import React from 'react';
import { SearchBar } from './search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user-store';
import { UserRole } from '@sentinel-ai/types';
import { UserAccountStatus } from '@/types/user';
import { RotateCcw, Filter } from 'lucide-react';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: UserRole | 'ALL';
  onRoleChange: (r: UserRole | 'ALL') => void;
  statusFilter: UserAccountStatus | 'ALL';
  onStatusChange: (s: UserAccountStatus | 'ALL') => void;
  onReset: () => void;
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  onReset
}: FilterToolbarProps) {
  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
        <SearchBar value={searchQuery} onChange={onSearchChange} />

        <div className="flex items-center gap-2">
          <Select value={roleFilter} onValueChange={(val) => onRoleChange(val as UserRole | 'ALL')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="EXAM_ADMIN">Exam Administrator</SelectItem>
              <SelectItem value="PROCTOR_SUPERVISOR">Proctor Supervisor</SelectItem>
              <SelectItem value="LIVE_PROCTOR">Live Proctor</SelectItem>
              <SelectItem value="COMPLIANCE_OFFICER">Compliance Officer</SelectItem>
              <SelectItem value="CANDIDATE">Candidate (Student)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => onStatusChange(val as UserAccountStatus | 'ALL')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-9 px-2 text-muted-foreground hover:text-foreground">
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
