'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Save } from 'lucide-react';
import { InstitutionConfiguration } from '@/services/institution.service';

interface SettingsPanelProps {
  initialConfig?: InstitutionConfiguration;
  onSave: (data: Partial<InstitutionConfiguration>) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsPanel({ initialConfig, onSave, isLoading }: SettingsPanelProps) {
  const [sensitivityProfile, setSensitivityProfile] = useState<'STRICT' | 'STANDARD' | 'LOW' | 'CUSTOM'>(
    initialConfig?.sensitivityProfile || 'STANDARD'
  );
  const [allowMobileExams, setAllowMobileExams] = useState(initialConfig?.allowMobileExams || false);
  const [ssoEnabled, setSsoEnabled] = useState(initialConfig?.ssoEnabled || false);
  const [ssoProvider, setSsoProvider] = useState(initialConfig?.ssoProvider || '');
  const [ipWhitelist, setIpWhitelist] = useState(initialConfig?.ipWhitelist?.join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ips = ipWhitelist.split(',').map((ip) => ip.trim()).filter(Boolean);
    await onSave({ sensitivityProfile, allowMobileExams, ssoEnabled, ssoProvider, ipWhitelist: ips });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Proctoring & Security Configuration</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sensitivity">Default Proctoring Sensitivity Profile</Label>
            <Select value={sensitivityProfile} onValueChange={(val: any) => setSensitivityProfile(val)}>
              <SelectTrigger id="sensitivity">
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRICT">Strict (Max Integrity Rules & Immediate Disqualification)</SelectItem>
                <SelectItem value="STANDARD">Standard (Recommended AI Flag Thresholds)</SelectItem>
                <SelectItem value="LOW">Low (Permissive Workspace Rules)</SelectItem>
                <SelectItem value="CUSTOM">Custom (Institution Policy Override)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="mobile" className="font-semibold">Allow Mobile Device Exam Join</Label>
              <p className="text-xs text-muted-foreground">Permit candidates to take assessments via mobile web browsers.</p>
            </div>
            <Switch id="mobile" checked={allowMobileExams} onCheckedChange={setAllowMobileExams} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="sso" className="font-semibold">Enable SAML / OAuth SSO Integration</Label>
              <p className="text-xs text-muted-foreground">Authenticate users via campus Single Sign-On IDP.</p>
            </div>
            <Switch id="sso" checked={ssoEnabled} onCheckedChange={setSsoEnabled} />
          </div>

          {ssoEnabled && (
            <div className="space-y-2">
              <Label htmlFor="provider">SSO Identity Provider URL</Label>
              <Input id="provider" placeholder="https://idp.university.edu/auth" value={ssoProvider} onChange={(e) => setSsoProvider(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ip">Campus IP Whitelist (Comma Separated)</Label>
            <Input id="ip" placeholder="192.168.1.1/24, 10.0.0.1" value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" /> {isLoading ? 'Updating...' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  );
}
