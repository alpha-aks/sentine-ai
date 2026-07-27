'use client';

import React from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { PublicRoute } from '@/components/auth/public-route';

export default function ResetPasswordPage() {
  return (
    <PublicRoute>
      <AuthCard
        title="New Password"
        description="Set your new account password"
      >
        <ResetPasswordForm />
      </AuthCard>
    </PublicRoute>
  );
}
