'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/utils/validators';
import { authService } from '@/services/auth.service';
import { PasswordStrength } from './password-strength';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Building, Eye, EyeOff } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CANDIDATE',
      acceptTerms: false
    }
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await authService.register(data);
      router.push('/login?registered=true');
    } catch (err: any) {
      if (err.message?.includes('AUTH_EMAIL_EXISTS')) {
        setError('An account with this email address already exists. Please sign in or use a different email.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="John Doe"
            className="pl-9"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="john@institution.edu"
            className="pl-9"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Institution ID</label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="inst_default"
              className="pl-9"
              error={errors.institutionId?.message}
              {...register('institutionId')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Platform Role</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            {...register('role')}
          >
            <option value="CANDIDATE">Candidate (Student)</option>
            <option value="LIVE_PROCTOR">Live Proctor</option>
            <option value="PROCTOR_SUPERVISOR">Proctor Supervisor</option>
            <option value="EXAM_ADMIN">Exam Administrator</option>
            <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-9 pr-10"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm Password</label>
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

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="acceptTerms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setValue('acceptTerms', Boolean(checked))}
        />
        <label htmlFor="acceptTerms" className="text-xs text-muted-foreground leading-snug cursor-pointer select-none">
          I accept the{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>.
        </label>
      </div>
      {errors.acceptTerms?.message && (
        <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
      )}

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
      </Button>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </p>
    </form>
  );
}
