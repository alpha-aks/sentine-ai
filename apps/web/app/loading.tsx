import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoadingSpinner text="Loading SentinelAI..." />
    </div>
  );
}
