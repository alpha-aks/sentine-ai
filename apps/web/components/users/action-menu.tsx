'use client';

import React from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UserEntity, UserAccountStatus } from '@/types/user';
import { MoreHorizontal, Eye, Edit3, ShieldAlert, CheckCircle2, Trash2, Key } from 'lucide-react';

interface ActionMenuProps {
  user: UserEntity;
  onStatusChange: (userId: string, newStatus: UserAccountStatus) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onAssignRole?: (userId: string) => void;
}

export function ActionMenu({ user, onStatusChange, onDelete, onAssignRole }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}/edit`} className="cursor-pointer">
            <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Profile
          </Link>
        </DropdownMenuItem>
        {onAssignRole && (
          <DropdownMenuItem onClick={() => onAssignRole(user.id)}>
            <Key className="mr-2 h-4 w-4 text-muted-foreground" /> Manage Roles
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {user.status === 'ACTIVE' ? (
          <DropdownMenuItem onClick={() => onStatusChange(user.id, 'SUSPENDED')} className="text-amber-400">
            <ShieldAlert className="mr-2 h-4 w-4" /> Suspend Account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onStatusChange(user.id, 'ACTIVE')} className="text-emerald-400">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Activate Account
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
