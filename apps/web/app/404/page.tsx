import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function Custom404Page() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded-full bg-muted p-4 text-muted-foreground mb-4">
        <FileQuestion className="h-12 w-12" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The requested page does not exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
