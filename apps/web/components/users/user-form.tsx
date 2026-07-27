'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@sentinel-ai/types';
import { UserEntity } from '@/types/user';
import { User, Mail, Phone, Building, ShieldCheck, Save, Loader2 } from 'lucide-react';

const userFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'LIVE_PROCTOR', 'COMPLIANCE_OFFICER', 'CANDIDATE']),
  institutionSlug: z.string().min(2, 'Institution slug is required'),
  phoneNumber: z.string().optional(),
  department: z.string().optional()
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialValues?: Partial<UserEntity>;
  onSubmit: (values: UserFormValues) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function UserForm({ initialValues, onSubmit, isLoading, isEdit }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: initialValues?.fullName || '',
      email: initialValues?.email || '',
      role: initialValues?.role || 'CANDIDATE',
      institutionSlug: initialValues?.institutionSlug || 'default',
      phoneNumber: initialValues?.phoneNumber || '',
      department: initialValues?.department || ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Identity & Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" placeholder="Jane Doe" className="pl-9" error={errors.fullName?.message} {...register('fullName')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@institution.edu"
                  className="pl-9"
                  disabled={isEdit}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="phoneNumber" placeholder="+1 (555) 019-2834" className="pl-9" {...register('phoneNumber')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="Computer Science" {...register('department')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Institutional Role & Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Platform Role *</Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                {...register('role')}
              >
                <option value="CANDIDATE">Candidate (Student / Examinee)</option>
                <option value="LIVE_PROCTOR">Live Invigilator / Proctor</option>
                <option value="PROCTOR_SUPERVISOR">Proctoring Supervisor</option>
                <option value="COMPLIANCE_OFFICER">Audit & Compliance Officer</option>
                <option value="EXAM_ADMIN">Platform Super Administrator</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionSlug">Tenant Institution Slug *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="institutionSlug" placeholder="default" className="pl-9" error={errors.institutionSlug?.message} {...register('institutionSlug')} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isEdit ? 'Update User Account' : 'Provision User Credentials'}
        </Button>
      </div>
    </form>
  );
}
