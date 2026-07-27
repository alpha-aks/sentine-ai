'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { UserTable } from '@/components/users/user-table';
import { FilterToolbar } from '@/components/users/filter-toolbar';
import { UserEntity, UserAccountStatus } from '@/types/user';
import { userService } from '@/services/user.service';
import { useUserStore } from '@/store/user-store';
import { UserPlus, RefreshCw } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    resetFilters,
    selectedUserIds,
    toggleSelectUser,
    selectAllUsers
  } = useUserStore();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.searchUsers({
        query: searchQuery,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(res.items);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleStatusChange = async (userId: string, newStatus: UserAccountStatus) => {
    await userService.updateStatus(userId, newStatus);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user account?')) {
      await userService.deleteUser(userId);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Provision accounts, assign institutional roles, and monitor user statuses"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/users/new">
                <UserPlus className="mr-2 h-4 w-4" /> Provision User
              </Link>
            </Button>
          </div>
        }
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={resetFilters}
      />

      <UserTable
        users={users}
        selectedIds={selectedUserIds}
        onToggleSelect={toggleSelectUser}
        onSelectAll={selectAllUsers}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
