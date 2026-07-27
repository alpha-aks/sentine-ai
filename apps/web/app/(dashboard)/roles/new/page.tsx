'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { RoleEditor } from '@/components/roles/role-editor';
import { roleService } from '@/services/role.service';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { name: string; description: string; permissions: string[] }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await roleService.createRole(data);
      router.push(`/roles/${created.id}`);
    } catch (err: any) {
      console.error('Failed to create role', err);
      setError(err.message || 'Failed to create role. Please check parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader title="Create Custom Role" description="Define role metadata and assign module permission matrices" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <RoleEditor onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
