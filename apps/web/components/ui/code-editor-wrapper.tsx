'use client';

import * as React from 'react';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';

interface CodeEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
}

export function CodeEditorWrapper({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  minHeight = '200px',
  className
}: CodeEditorWrapperProps) {
  const lineCount = (value || '').split('\n').length;

  return (
    <div className={cn('relative rounded-md border border-input bg-zinc-950 font-mono text-sm text-zinc-100', className)}>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
        <span className="font-semibold uppercase tracking-wider">{language}</span>
        <span>{lineCount} lines</span>
      </div>

      <div className="flex">
        {/* Line numbers */}
        <div className="select-none py-2 pl-3 pr-2 text-right text-xs text-zinc-600 border-r border-zinc-800">
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Editor Area */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          style={{ minHeight }}
          className="border-0 bg-transparent p-2 text-sm text-zinc-100 font-mono focus-visible:ring-0 rounded-none resize-y"
          placeholder="// Write your code here..."
        />
      </div>
    </div>
  );
}
