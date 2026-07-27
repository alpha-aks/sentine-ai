'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/utils/validators';
import { authService } from '@/services/auth.service';
import { PasswordStrength } from './password-strength';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token
    }
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!data.token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    try {
      setError(null);
      await authService.resetPassword(data.token, data.newPassword);
      router.push('/login?reset=true');
    } catch (err: any) {
      if (err.message?.includes('AUTH_TOKEN_EXPIRED')) {
        setError('Your password reset link has expired. Please request a new link.');
      } else if (err.message?.includes('AUTH_INVALID_TOKEN')) {
        setError('Invalid password reset token. Please check your reset email link.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!token && (
        <Alert variant="destructive">
          <AlertDescription>No reset token found in URL parameters. Please check your email link.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <input type="hidden" value={token} {...register('token')} />

      <div className="space-y-2">
        <label className="text-sm font-medium">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-9 pr-10"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrength password={newPassword} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="••••••••"
            className="pl-9"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting || !token}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Password'}
      </Button>

      <p className="text-center text-xs text-muted-foreground pt-2">
        <Link href="/login" className="text-primary hover:underline">
          Cancel and return to login
        </Link>
      </p>
    </form>
  );
}
