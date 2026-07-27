'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/auth/loading-screen';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  return <LoadingScreen text="Signing out of SentinelAI..." />;
}
