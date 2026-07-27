'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save } from 'lucide-react';

const institutionFormSchema = z.object({
  name: z.string().min(3, 'Institution name must be at least 3 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  slug: z.string().optional(),
  type: z.enum(['UNIVERSITY', 'COLLEGE', 'HIGH_SCHOOL', 'CERTIFICATION_BODY']),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  academicYearStart: z.string().default('September')
});

export type InstitutionFormValues = z.infer<typeof institutionFormSchema>;

interface InstitutionFormProps {
  initialValues?: Partial<InstitutionFormValues>;
  onSubmit: (values: InstitutionFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function InstitutionForm({ initialValues, onSubmit, isLoading }: InstitutionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      code: initialValues?.code || '',
      type: initialValues?.type || 'UNIVERSITY',
      contactEmail: initialValues?.contactEmail || '',
      contactPhone: initialValues?.contactPhone || '',
      address: initialValues?.address || '',
      website: initialValues?.website || '',
      timezone: initialValues?.timezone || 'UTC',
      language: initialValues?.language || 'en',
      academicYearStart: initialValues?.academicYearStart || 'September'
    }
  });

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">General Institution Metadata</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Institution Name *</Label>
            <Input id="name" placeholder="e.g. Stanford University" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Institution Code *</Label>
            <Input id="code" placeholder="e.g. STANFORD" {...register('code')} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Institution Category *</Label>
            <Select value={selectedType} onValueChange={(val: any) => setValue('type', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNIVERSITY">University</SelectItem>
                <SelectItem value="COLLEGE">College</SelectItem>
                <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                <SelectItem value="CERTIFICATION_BODY">Certification Body</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input id="contactEmail" type="email" placeholder="admin@university.edu" {...register('contactEmail')} />
            {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input id="contactPhone" placeholder="+1 (555) 019-2834" {...register('contactPhone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input id="website" placeholder="https://university.edu" {...register('website')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" placeholder="America/Los_Angeles" {...register('timezone')} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Physical Address</Label>
            <Input id="address" placeholder="450 Jane Stanford Way, Stanford, CA 94305" {...register('address')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
          <Save className="mr-2 h-4 w-4" /> {isLoading ? 'Saving...' : 'Save Institution'}
        </Button>
      </div>
    </form>
  );
}
