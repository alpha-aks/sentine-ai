'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  className
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose} />
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex max-w-full bg-background shadow-xl transition-transform duration-300',
          side === 'right' ? 'right-0 w-96' : 'left-0 w-96',
          className
        )}
      >
        <div className="flex h-full w-full flex-col p-6">
          <div className="flex items-center justify-between border-b pb-4">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            <button onClick={onClose} className="rounded-sm p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
