'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { UserForm, UserFormValues } from '@/components/users/user-form';
import { userService } from '@/services/user.service';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await userService.createUser({
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        institutionSlug: values.institutionSlug,
        institutionId: `inst_${values.institutionSlug}`,
        phoneNumber: values.phoneNumber,
        department: values.department
      });
      router.push(`/users/${created.id}`);
    } catch (err: any) {
      console.error('Failed to create user', err);
      setError(err.message || 'Failed to provision user credentials. Please check input parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Provision New User Account" description="Assign platform roles, institution membership, and security parameters" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <UserForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
