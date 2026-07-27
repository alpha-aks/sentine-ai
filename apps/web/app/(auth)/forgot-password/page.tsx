'use client';

import React from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { PublicRoute } from '@/components/auth/public-route';

export default function ForgotPasswordPage() {
  return (
    <PublicRoute>
      <AuthCard
        title="Reset Password"
        description="Enter your email to receive password reset instructions"
      >
        <ForgotPasswordForm />
      </AuthCard>
    </PublicRoute>
  );
}
