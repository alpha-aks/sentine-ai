import React from 'react';

interface TrueFalseAnswerProps {
  value?: boolean | string;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export function TrueFalseAnswer({ value, onChange, disabled }: TrueFalseAnswerProps) {
  const boolVal = typeof value === 'string' ? value.toLowerCase() === 'true' : value;

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`p-4 rounded-xl border text-center font-bold text-base transition-colors ${
          boolVal === true
            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
            : 'border-border bg-card hover:bg-accent text-foreground'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        TRUE
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`p-4 rounded-xl border text-center font-bold text-base transition-colors ${
          boolVal === false
            ? 'border-rose-500 bg-rose-500/15 text-rose-400'
            : 'border-border bg-card hover:bg-accent text-foreground'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        FALSE
      </button>
    </div>
  );
}
