'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { InstitutionForm, InstitutionFormValues } from '@/components/institutions/institution-form';
import { institutionService } from '@/services/institution.service';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewInstitutionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: InstitutionFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await institutionService.create(values);
      const targetId = created.id || (created as any).institutionId;
      if (targetId) {
        router.push(`/institutions/${targetId}`);
      } else {
        router.push('/institutions');
      }
    } catch (err: any) {
      console.error('Failed to create institution', err);
      if (err.message?.includes('INSTITUTION_CONFLICT')) {
        setError('An institution with this code or slug is already registered. Please use a unique code.');
      } else if (err.message?.includes('FORBIDDEN') || err.message?.includes('permission')) {
        setError('Insufficient permissions. Please log out and sign in with an Exam Admin account.');
      } else {
        setError(err.message || 'Failed to provision institution. Please check fields and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Provision New Academic Institution" description="Configure tenant credentials, contacts, and domain preferences" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <InstitutionForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
