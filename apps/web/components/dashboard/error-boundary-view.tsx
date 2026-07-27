'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorBoundaryView({
  error,
  reset
}: {
  error?: Error | null;
  reset?: () => void;
}) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-3">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Section Load Failed</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        {error?.message || 'An error occurred while rendering this dashboard component.'}
      </p>
      {reset && (
        <Button onClick={reset} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry Loading
        </Button>
      )}
    </div>
  );
}
