import React from 'react';
import { Input } from '@/components/ui/input';

interface NumericalAnswerProps {
  value?: number | string;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function NumericalAnswer({ value, onChange, disabled }: NumericalAnswerProps) {
  const displayVal = value !== undefined && value !== null ? String(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className="space-y-2 max-w-sm">
      <Input
        type="number"
        step="any"
        placeholder="Enter numerical answer..."
        value={displayVal}
        disabled={disabled}
        onChange={handleChange}
        className="w-full text-sm font-mono"
      />
      <div className="text-xs text-muted-foreground">
        Enter precise numerical value (decimals supported)
      </div>
    </div>
  );
}
