import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded-full bg-amber-500/10 p-4 text-amber-500 mb-4">
        <Lock className="h-12 w-12" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">401 - Unauthorized</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Authentication is required to access this resource. Please sign in with your credentials.
      </p>
      <Button asChild className="mt-6">
        <Link href="/login">Sign In</Link>
      </Button>
    </div>
  );
}
