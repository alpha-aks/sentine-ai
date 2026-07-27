import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderingAnswerProps {
  items: string[];
  value?: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

export function OrderingAnswer({ items, value, onChange, disabled }: OrderingAnswerProps) {
  const currentList = value && value.length === items.length ? value : items;

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    if (disabled) return;
    const newList = [...currentList];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newList.length) return;
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;
    onChange(newList);
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground mb-1">
        Use arrows to reorder items into correct chronological or sequence order:
      </div>

      {currentList.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card text-sm gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
              {idx + 1}
            </span>
            <span className="font-medium text-foreground">{item}</span>
          </div>

          {!disabled && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={idx === 0}
                onClick={() => moveItem(idx, 'UP')}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={idx === currentList.length - 1}
                onClick={() => moveItem(idx, 'DOWN')}
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
