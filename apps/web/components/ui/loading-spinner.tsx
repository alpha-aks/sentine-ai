import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, text }: { className?: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" suppressHydrationWarning>
      <Loader2 className={cn('h-8 w-8 animate-spin text-primary', className)} suppressHydrationWarning />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
