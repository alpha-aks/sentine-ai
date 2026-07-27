import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded-full bg-muted p-4 text-muted-foreground mb-4">
        <FileQuestion className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-bold">404 - Not Found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Could not find requested resource.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Return Home</Link>
      </Button>
    </div>
  );
}
