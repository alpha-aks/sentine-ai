import React from 'react';

interface MatchingAnswerProps {
  pairs: { left: string; rightOptions: string[] }[];
  value?: Record<string, string>;
  onChange: (val: Record<string, string>) => void;
  disabled?: boolean;
}

export function MatchingAnswer({ pairs, value = {}, onChange, disabled }: MatchingAnswerProps) {
  const handleSelect = (left: string, right: string) => {
    if (disabled) return;
    onChange({
      ...value,
      [left]: right
    });
  };

  return (
    <div className="space-y-4">
      {pairs.map((pair, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg border border-border bg-card gap-3">
          <div className="text-sm font-semibold text-foreground flex-1">
            {pair.left}
          </div>

          <select
            value={value[pair.left] || ''}
            disabled={disabled}
            onChange={(e) => handleSelect(pair.left, e.target.value)}
            className="w-full sm:w-64 p-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60"
          >
            <option value="">-- Select Matching Option --</option>
            {pair.rightOptions.map((opt, optIdx) => (
              <option key={optIdx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
