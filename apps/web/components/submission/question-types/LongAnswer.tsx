import React from 'react';

interface LongAnswerProps {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function LongAnswer({ value = '', onChange, disabled }: LongAnswerProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-2">
      <textarea
        rows={8}
        placeholder="Type your essay or detailed response here..."
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 rounded-lg border border-border bg-card text-foreground text-sm font-sans leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Detailed text response</span>
        <span>{wordCount} words | {value.length} characters</span>
      </div>
    </div>
  );
}
