'use client';

import React from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';
import { PublicRoute } from '@/components/auth/public-route';

export default function RegisterPage() {
  return (
    <PublicRoute>
      <AuthCard
        title="Create Account"
        description="Register your account on SentinelAI"
      >
        <RegisterForm />
      </AuthCard>
    </PublicRoute>
  );
}
