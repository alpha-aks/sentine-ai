'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { UserProfileCard } from '@/components/users/user-profile-card';
import { UserEntity } from '@/types/user';
import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Edit3, Shield, Activity } from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [user, setUser] = useState<UserEntity | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    userService
      .getUserById(id)
      .then(async (data) => {
        setUser(data);
        try {
          const role = await roleService.getRoleById(data.role);
          setRolePermissions(role.permissions || []);
        } catch {
          setRolePermissions([]);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <LoadingSkeleton rows={6} className="max-w-4xl mx-auto mt-6" />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">User Not Found</h2>
        <p className="text-muted-foreground mt-1">The requested user account does not exist.</p>
        <Button className="mt-4" onClick={() => router.push('/users')}>
          Return to Users Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="User Account Details"
        description="Inspect security roles, active permissions, audit events, and preferences"
        actions={
          <Button size="sm" asChild>
            <Link href={`/users/${user.id}/edit`}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Link>
          </Button>
        }
      />

      <UserProfileCard user={user} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Effective Permissions ({rolePermissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {rolePermissions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No explicit role permissions mapped.</p>
              ) : (
                rolePermissions.map((perm) => (
                  <Badge key={perm} variant="secondary" className="font-mono text-[11px]">
                    {perm}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Session & Audit History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-mono">{new Date(user.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground">Last Profile Sync</span>
              <span className="font-mono">{new Date(user.updatedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security State</span>
              <span className="font-semibold text-emerald-400">Authenticated & Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
