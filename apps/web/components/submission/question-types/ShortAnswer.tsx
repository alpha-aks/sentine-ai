import React from 'react';
import { Input } from '@/components/ui/input';

interface ShortAnswerProps {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function ShortAnswer({ value = '', onChange, disabled }: ShortAnswerProps) {
  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Type your short response..."
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm"
      />
      <div className="text-xs text-muted-foreground text-right">
        {value.length} characters
      </div>
    </div>
  );
}
