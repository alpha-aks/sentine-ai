'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No verification token found in link URL.');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        await authService.verifyEmail(token!);
        if (isMounted) {
          setSuccess(true);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.message?.includes('AUTH_TOKEN_EXPIRED')) {
            setError('Verification link has expired. Please request a new link.');
          } else {
            setError(err.message || 'Email verification failed.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Verifying your email address...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold">Email Verified!</h3>
        <p className="text-sm text-muted-foreground">
          Your email address has been successfully verified. You can now access all SentinelAI platform features.
        </p>
        <Button asChild className="w-full mt-2">
          <Link href="/login">Continue to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center py-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold">Verification Failed</h3>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button asChild variant="outline" className="w-full mt-2">
        <Link href="/login">Return to Sign In</Link>
      </Button>
    </div>
  );
}
