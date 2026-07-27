'use client';

import React, { useState } from 'react';
import { PermissionDefinition } from '@/types/user';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface PermissionSelectorProps {
  permissions: PermissionDefinition[];
  selectedCodes: string[];
  onSelect: (code: string) => void;
}

export function PermissionSelector({ permissions, selectedCodes, onSelect }: PermissionSelectorProps) {
  const [query, setQuery] = useState('');

  const filtered = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter permissions by name or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="max-h-60 overflow-y-auto divide-y rounded-md border">
        {filtered.map((perm) => {
          const isSelected = selectedCodes.includes(perm.code);
          return (
            <div
              key={perm.code}
              onClick={() => onSelect(perm.code)}
              className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                isSelected ? 'bg-primary/10' : 'hover:bg-muted/40'
              }`}
            >
              <div>
                <span className="font-semibold text-foreground">{perm.name}</span>
                <span className="font-mono text-muted-foreground ml-2">({perm.code})</span>
                <p className="text-muted-foreground text-[11px] mt-0.5">{perm.description}</p>
              </div>
              <Badge variant={isSelected ? 'default' : 'outline'} className="text-[10px]">
                {isSelected ? 'Granted' : 'Revoked'}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
