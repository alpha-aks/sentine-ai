'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { InstitutionForm, InstitutionFormValues } from '@/components/institutions/institution-form';
import { institutionService, Institution } from '@/services/institution.service';

export default function EditInstitutionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    institutionService
      .getById(id)
      .then((data) => setInstitution(data))
      .catch(() => setInstitution(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (values: InstitutionFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await institutionService.update(id, values);
      router.push(`/institutions/${id}`);
    } catch (err) {
      console.error('Failed to update institution', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading institution metadata...</div>;
  }

  if (!institution) {
    return <div className="p-8 text-center border rounded-md">Institution record not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title={`Edit ${institution.name}`} description="Update contact details, category, address, and timezone" />
      <InstitutionForm initialValues={institution} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
