'use client';

import React, { useEffect, useState } from 'react';
import { SYSTEM_PERMISSIONS, permissionService } from '@/services/permission.service';
import { PermissionDefinition } from '@/types/user';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface PermissionMatrixProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

const categoryLabels: Record<string, string> = {
  USERS: 'User & Role Management',
  EXAMS: 'Exams & Live Proctoring',
  QUESTIONS: 'Question Item Bank',
  INSTITUTIONS: 'Institution Administration',
  REPORTS: 'Reports & Audit Logs',
  SYSTEM: 'Global Security & Config'
};

export function PermissionMatrix({ selectedPermissions, onChange, disabled }: PermissionMatrixProps) {
  const [grouped, setGrouped] = useState<Record<string, PermissionDefinition[]>>({});

  useEffect(() => {
    permissionService.getPermissionsByCategory().then((res) => setGrouped(res));
  }, []);

  const handleToggle = (code: string) => {
    if (disabled) return;
    if (selectedPermissions.includes(code)) {
      onChange(selectedPermissions.filter((p) => p !== code));
    } else {
      onChange([...selectedPermissions, code]);
    }
  };

  const handleToggleCategory = (category: string, itemCodes: string[]) => {
    if (disabled) return;
    const allSelected = itemCodes.every((code) => selectedPermissions.includes(code));
    if (allSelected) {
      onChange(selectedPermissions.filter((code) => !itemCodes.includes(code)));
    } else {
      const merged = Array.from(new Set([...selectedPermissions, ...itemCodes]));
      onChange(merged);
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => {
        const itemCodes = items.map((i) => i.code);
        const selectedCount = itemCodes.filter((code) => selectedPermissions.includes(code)).length;
        const allSelected = itemCodes.length > 0 && selectedCount === itemCodes.length;

        return (
          <div key={category} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => handleToggleCategory(category, itemCodes)}
                  disabled={disabled}
                />
                <h4 className="font-semibold text-sm text-foreground">
                  {categoryLabels[category] || category}
                </h4>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {selectedCount} / {items.length} Enabled
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1">
              {items.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.code);
                return (
                  <label
                    key={perm.code}
                    className={`flex items-start gap-3 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      isChecked ? 'bg-primary/5 border-primary/30' : 'bg-background hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggle(perm.code)}
                      disabled={disabled}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-foreground">{perm.name}</div>
                      <div className="text-muted-foreground mt-0.5 text-[11px] leading-snug">{perm.description}</div>
                      <div className="font-mono text-[10px] text-muted-foreground/70 mt-1">{perm.code}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
