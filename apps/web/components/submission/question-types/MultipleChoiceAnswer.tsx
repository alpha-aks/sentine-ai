import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface MultipleChoiceAnswerProps {
  options: string[];
  value?: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

export function MultipleChoiceAnswer({ options, value = [], onChange, disabled }: MultipleChoiceAnswerProps) {
  const handleToggle = (option: string) => {
    if (disabled) return;
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, idx) => {
        const isChecked = value.includes(option);
        return (
          <label
            key={idx}
            className={`flex items-center gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition-colors ${
              isChecked
                ? 'border-primary bg-primary/10 font-semibold text-foreground'
                : 'border-border bg-card hover:bg-accent hover:text-accent-foreground'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => handleToggle(option)}
              disabled={disabled}
              className="h-4 w-4"
            />
            <span className="flex-1">{option}</span>
          </label>
        );
      })}
    </div>
  );
}
