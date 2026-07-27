import { z } from 'zod';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Weak' | 'Medium' | 'Strong' | 'Excellent';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase && hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let label: PasswordStrengthResult['label'] = 'Weak';
  if (score === 2) label = 'Medium';
  if (score === 3) label = 'Strong';
  if (score >= 4) label = 'Excellent';

  return {
    score,
    label,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  };
}

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  institutionId: z.string().min(1, 'Institution is required'),
  role: z.enum(['CANDIDATE', 'LIVE_PROCTOR', 'PROCTOR_SUPERVISOR', 'EXAM_ADMIN', 'COMPLIANCE_OFFICER']),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const createExamSchema = z.object({
  code: z.string().min(3, 'Exam code must be at least 3 characters'),
  title: z.string().min(5, 'Exam title must be at least 5 characters'),
  description: z.string().optional(),
  type: z.enum(['QUIZ', 'MIDTERM', 'FINAL_EXAM', 'CERTIFICATION', 'PRACTICE']),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'ADAPTIVE']),
  totalDurationMinutes: z.number().min(5, 'Duration must be at least 5 minutes'),
  passingPercentage: z.number().min(1).max(100)
});

export type CreateExamFormData = z.infer<typeof createExamSchema>;
