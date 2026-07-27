import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface SubmissionErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function SubmissionError({
  title = 'Submission Service Error',
  message = 'An unexpected error occurred while loading your examination submission.',
  onRetry
}: SubmissionErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 w-full">
      <Card className="max-w-md w-full border border-rose-500/30 bg-card text-center p-6 space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        </div>

        <CardContent className="pt-2 flex justify-center gap-3">
          {onRetry && (
            <Button size="sm" onClick={onRetry} className="bg-primary">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry Connection
            </Button>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link href="/candidate">
              <Home className="mr-1.5 h-3.5 w-3.5" /> Return to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
