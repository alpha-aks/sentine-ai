'use client';

import React, { useState } from 'react';
import { ExamRuleEntity } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Lock, Save, Loader2 } from 'lucide-react';

interface SecurityPolicyPanelProps {
  rules?: ExamRuleEntity;
  onSave: (rules: Partial<ExamRuleEntity>) => Promise<void>;
  isLoading?: boolean;
}

export function SecurityPolicyPanel({ rules, onSave, isLoading }: SecurityPolicyPanelProps) {
  const [browserLockEnabled, setBrowserLockEnabled] = useState(rules?.browserLockEnabled ?? true);
  const [fullscreenRequired, setFullscreenRequired] = useState(rules?.fullscreenRequired ?? true);
  const [tabSwitchDetection, setTabSwitchDetection] = useState(rules?.tabSwitchDetection ?? true);
  const [copyPasteRestricted, setCopyPasteRestricted] = useState(rules?.copyPasteRestricted ?? true);
  const [multiMonitorBlocked, setMultiMonitorBlocked] = useState(rules?.multiMonitorBlocked ?? true);
  const [virtualMachineBlocked, setVirtualMachineBlocked] = useState(rules?.virtualMachineBlocked ?? true);
  const [devToolsBlocked, setDevToolsBlocked] = useState(rules?.devToolsBlocked ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      browserLockEnabled,
      fullscreenRequired,
      tabSwitchDetection,
      copyPasteRestricted,
      multiMonitorBlocked,
      virtualMachineBlocked,
      devToolsBlocked
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Browser Sandbox & Environment Integrity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Secure Browser Lock Enforcement</div>
              <div className="text-xs text-muted-foreground">Locks candidate browser into full isolation container mode.</div>
            </div>
            <Switch checked={browserLockEnabled} onCheckedChange={setBrowserLockEnabled} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Mandatory Fullscreen Mode</div>
              <div className="text-xs text-muted-foreground">Forces fullscreen mode and flags window unfocus events.</div>
            </div>
            <Switch checked={fullscreenRequired} onCheckedChange={setFullscreenRequired} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Tab Switching Detection</div>
              <div className="text-xs text-muted-foreground">Monitors and logs candidate tab focus changes.</div>
            </div>
            <Switch checked={tabSwitchDetection} onCheckedChange={setTabSwitchDetection} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Restrict Copy & Paste Clipboard</div>
              <div className="text-xs text-muted-foreground">Disables text copy, paste, and right-click context menus.</div>
            </div>
            <Switch checked={copyPasteRestricted} onCheckedChange={setCopyPasteRestricted} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Block Multiple Monitors</div>
              <div className="text-xs text-muted-foreground">Detects and blocks secondary external displays.</div>
            </div>
            <Switch checked={multiMonitorBlocked} onCheckedChange={setMultiMonitorBlocked} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Block Virtual Machines</div>
              <div className="text-xs text-muted-foreground">Detects VirtualBox, VMware, and hypervisor execution.</div>
            </div>
            <Switch checked={virtualMachineBlocked} onCheckedChange={setVirtualMachineBlocked} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Block Developer Tools (F12)</div>
              <div className="text-xs text-muted-foreground">Blocks browser DevTools and inspection shortcut keys.</div>
            </div>
            <Switch checked={devToolsBlocked} onCheckedChange={setDevToolsBlocked} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Security Policy
        </Button>
      </div>
    </form>
  );
}
