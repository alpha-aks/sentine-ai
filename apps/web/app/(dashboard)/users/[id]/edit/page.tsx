'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { UserForm, UserFormValues } from '@/components/users/user-form';
import { UserEntity } from '@/types/user';
import { userService } from '@/services/user.service';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    userService
      .getUserById(id)
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (values: UserFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await userService.updateUser(id, {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber
      });
      if (values.role && user && values.role !== user.role) {
        await userService.assignRole(id, values.role);
      }
      router.push(`/users/${id}`);
    } catch (err: any) {
      console.error('Failed to update user', err);
      setError(err.message || 'Failed to update user account. Please check parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} className="max-w-4xl mx-auto mt-6" />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">User Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title={`Edit User — ${user.fullName}`} description="Update profile information, department assignments, and security roles" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <UserForm initialValues={user} onSubmit={handleSubmit} isLoading={isSubmitting} isEdit />
    </div>
  );
}
