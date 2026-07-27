import React from 'react';

interface SingleChoiceAnswerProps {
  options: string[];
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function SingleChoiceAnswer({ options, value, onChange, disabled }: SingleChoiceAnswerProps) {
  return (
    <div className="space-y-3">
      {options.map((option, idx) => {
        const isSelected = value === option;
        return (
          <label
            key={idx}
            className={`flex items-center gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition-colors ${
              isSelected
                ? 'border-primary bg-primary/10 font-semibold text-foreground'
                : 'border-border bg-card hover:bg-accent hover:text-accent-foreground'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="single-choice-option"
              value={option}
              checked={isSelected}
              disabled={disabled}
              onChange={() => onChange(option)}
              className="h-4 w-4 text-primary accent-primary"
            />
            <span className="flex-1">{option}</span>
          </label>
        );
      })}
    </div>
  );
}
