'use client';

import * as React from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { Textarea } from './textarea';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface RichTextWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextWrapper({
  value,
  onChange,
  placeholder = 'Type your response here...',
  minHeight = '150px',
  className
}: RichTextWrapperProps) {
  const insertFormatting = (prefix: string, suffix: string = '') => {
    onChange(`${value}${prefix}${suffix}`);
  };

  return (
    <div className={cn('rounded-md border border-input bg-transparent', className)}>
      <div className="flex items-center gap-1 border-b bg-muted/30 p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertFormatting('**', '**')}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertFormatting('_', '_')}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertFormatting('\n- ')}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertFormatting('\n1. ')}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight }}
        className="border-0 bg-transparent p-3 focus-visible:ring-0 rounded-none shadow-none"
      />
    </div>
  );
}
