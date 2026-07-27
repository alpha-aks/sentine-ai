'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsPanel } from '@/components/institutions/settings-panel';
import { institutionService, InstitutionConfiguration } from '@/services/institution.service';

export default function InstitutionSettingsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [config, setConfig] = useState<InstitutionConfiguration | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    institutionService
      .getConfiguration(id)
      .then((data) => setConfig(data))
      .catch(() => setConfig(undefined))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async (data: Partial<InstitutionConfiguration>) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const updated = await institutionService.updateConfiguration(id, data);
      setConfig(updated);
    } catch (err) {
      console.error('Failed to update configuration', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading proctoring security settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Proctoring & Security Policies" description="Configure sensitivity thresholds, IP whitelists, and SAML SSO integration" />
      <SettingsPanel initialConfig={config} onSave={handleSave} isLoading={isSubmitting} />
    </div>
  );
}
