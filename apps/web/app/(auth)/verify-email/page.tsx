'use client';

import React from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { VerifyEmailCard } from '@/components/auth/verify-email-card';

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Email Verification">
      <VerifyEmailCard />
    </AuthCard>
  );
}
