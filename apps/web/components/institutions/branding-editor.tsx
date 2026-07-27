'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Save } from 'lucide-react';
import { InstitutionBranding } from '@/services/institution.service';

interface BrandingEditorProps {
  initialBranding?: InstitutionBranding;
  onSave: (data: Partial<InstitutionBranding>) => Promise<void>;
  isLoading?: boolean;
}

export function BrandingEditor({ initialBranding, onSave, isLoading }: BrandingEditorProps) {
  const [logoUrl, setLogoUrl] = useState(initialBranding?.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(initialBranding?.faviconUrl || '');
  const [primaryColor, setPrimaryColor] = useState(initialBranding?.primaryColor || '#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState(initialBranding?.secondaryColor || '#06B6D4');
  const [portalSubdomain, setPortalSubdomain] = useState(initialBranding?.portalSubdomain || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ logoUrl, faviconUrl, primaryColor, secondaryColor, portalSubdomain });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Portal Branding & Identity</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input id="logo" placeholder="https://cdn.institution.edu/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favicon">Favicon URL</Label>
            <Input id="favicon" placeholder="https://cdn.institution.edu/favicon.ico" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary">Primary Brand Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-12 rounded cursor-pointer border" />
              <Input id="primary" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary">Secondary Accent Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-9 w-12 rounded cursor-pointer border" />
              <Input id="secondary" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono" />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subdomain">Custom Portal Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input id="subdomain" placeholder="stanford" value={portalSubdomain} onChange={(e) => setPortalSubdomain(e.target.value)} />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">.sentinelai.edu</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" /> {isLoading ? 'Updating...' : 'Save Portal Branding'}
        </Button>
      </div>
    </form>
  );
}
