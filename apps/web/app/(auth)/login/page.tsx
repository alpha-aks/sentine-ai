'use client';

import React from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';
import { PublicRoute } from '@/components/auth/public-route';

export default function LoginPage() {
  return (
    <PublicRoute>
      <AuthCard
        title="Sign in"
        description="Enter your email and password to access SentinelAI"
      >
        <LoginForm />
      </AuthCard>
    </PublicRoute>
  );
}
