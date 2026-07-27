'use client';

import React from 'react';
import { UserEntity } from '@/types/user';
import { UserAvatar } from './user-avatar';
import { StatusBadge } from './status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, Building2, Shield, Hash } from 'lucide-react';

interface UserProfileCardProps {
  user: UserEntity;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b" />
      <CardContent className="pt-0 relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
          <div className="flex items-end gap-4">
            <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} role={user.role} size="xl" className="ring-4 ring-background" />
            <div className="mb-1">
              <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs px-3 py-1">
              {user.role}
            </Badge>
            <StatusBadge status={user.status} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2 text-sm">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Hash className="h-4 w-4 text-primary" />
            <span>ID: <strong className="text-foreground font-mono">{user.id}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Institution: <strong className="text-foreground">{user.institutionSlug || user.institutionId}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>Phone: <strong className="text-foreground">{user.phoneNumber || 'N/A'}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Department: <strong className="text-foreground">{user.department || 'General'}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Joined: <strong className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
