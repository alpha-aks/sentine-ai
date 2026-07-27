'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { RoleEditor } from '@/components/roles/role-editor';
import { RoleEntity } from '@/types/user';
import { roleService } from '@/services/role.service';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [role, setRole] = useState<RoleEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    roleService
      .getRoleById(id)
      .then((data) => setRole(data))
      .catch(() => setRole(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (data: { name: string; description: string; permissions: string[] }) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await roleService.updateRole(id, data);
      router.push('/roles');
    } catch (err: any) {
      console.error('Failed to update role', err);
      setError(err.message || 'Failed to update role. Please check parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} className="max-w-5xl mx-auto mt-6" />;
  }

  if (!role) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Role Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader title={`Role Specification — ${role.name}`} description="Modify granted permissions, category scopes, and role descriptions" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <RoleEditor role={role} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
