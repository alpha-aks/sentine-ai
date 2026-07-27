'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { BrandingEditor } from '@/components/institutions/branding-editor';
import { institutionService, InstitutionBranding } from '@/services/institution.service';

export default function BrandingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [branding, setBranding] = useState<InstitutionBranding | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    institutionService
      .getBranding(id)
      .then((data) => setBranding(data))
      .catch(() => setBranding(undefined))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async (data: Partial<InstitutionBranding>) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const updated = await institutionService.updateBranding(id, data);
      setBranding(updated);
    } catch (err) {
      console.error('Failed to update branding', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading portal branding configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Portal Branding & Identity" description="Configure candidate exam portal logos, primary accent colors, and custom subdomains" />
      <BrandingEditor initialBranding={branding} onSave={handleSave} isLoading={isSubmitting} />
    </div>
  );
}
