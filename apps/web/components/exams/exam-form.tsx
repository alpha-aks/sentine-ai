'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExamEntity } from '@/types/exam';
import { ShieldCheck, Clock, Save, Loader2 } from 'lucide-react';

const examFormSchema = z.object({
  title: z.string().min(3, 'Exam title must be at least 3 characters'),
  code: z.string().min(2, 'Exam code must be at least 2 characters').toUpperCase(),
  type: z.enum(['QUIZ', 'MIDTERM', 'FINAL_EXAM', 'CERTIFICATION', 'PRACTICE']),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'ADAPTIVE']),
  totalDurationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  passingPercentage: z.coerce.number().min(1).max(100),
  totalPoints: z.coerce.number().min(1),
  maxAttemptsAllowed: z.coerce.number().min(1),
  description: z.string().optional()
});

export type ExamFormValues = z.infer<typeof examFormSchema>;

interface ExamFormProps {
  initialValues?: Partial<ExamEntity>;
  onSubmit: (values: ExamFormValues) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function ExamForm({ initialValues, onSubmit, isLoading, isEdit }: ExamFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: initialValues?.title || '',
      code: initialValues?.code || '',
      type: initialValues?.type || 'QUIZ',
      difficultyLevel: initialValues?.difficultyLevel || 'MEDIUM',
      totalDurationMinutes: initialValues?.totalDurationMinutes || 60,
      passingPercentage: initialValues?.passingPercentage || 60,
      totalPoints: initialValues?.totalPoints || 100,
      maxAttemptsAllowed: initialValues?.maxAttemptsAllowed || 1,
      description: initialValues?.description || ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> General Exam Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title *</Label>
              <Input id="title" placeholder="CS101 Midterm Assessment" error={errors.title?.message} {...register('title')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Exam Code *</Label>
              <Input id="code" placeholder="EXAM-2026-CS101" disabled={isEdit} error={errors.code?.message} {...register('code')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Exam Type *</Label>
              <select
                id="type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                {...register('type')}
              >
                <option value="QUIZ">Quiz</option>
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL_EXAM">Final Exam</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="PRACTICE">Practice Test</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
              <select
                id="difficultyLevel"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                {...register('difficultyLevel')}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="ADAPTIVE">Adaptive AI</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Objective Summary</Label>
            <Textarea id="description" placeholder="Comprehensive evaluation covering data structures and algorithms..." {...register('description')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Timing, Scoring & Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="totalDurationMinutes">Total Duration (Mins) *</Label>
              <Input id="totalDurationMinutes" type="number" min={1} error={errors.totalDurationMinutes?.message} {...register('totalDurationMinutes')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingPercentage">Passing Grade (%) *</Label>
              <Input id="passingPercentage" type="number" min={1} max={100} error={errors.passingPercentage?.message} {...register('passingPercentage')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPoints">Total Points *</Label>
              <Input id="totalPoints" type="number" min={1} error={errors.totalPoints?.message} {...register('totalPoints')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttemptsAllowed">Max Attempts *</Label>
              <Input id="maxAttemptsAllowed" type="number" min={1} error={errors.maxAttemptsAllowed?.message} {...register('maxAttemptsAllowed')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isEdit ? 'Update Exam Specification' : 'Create Exam Draft'}
        </Button>
      </div>
    </form>
  );
}
