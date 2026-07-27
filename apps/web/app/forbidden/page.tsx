import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive mb-4">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">403 - Forbidden</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You do not have the required role or permissions to access this page.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
