'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Edit, GraduationCap, BookOpen, Users, Palette, ShieldCheck, Calendar } from 'lucide-react';
import { institutionService, Institution } from '@/services/institution.service';

export default function InstitutionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    institutionService
      .getById(id)
      .then((data) => setInstitution(data))
      .catch(() => setInstitution(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading institution details...</div>;
  }

  if (!institution) {
    return (
      <div className="p-8 text-center border rounded-md">
        <h3 className="text-lg font-bold">Institution Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1">The specified institution record does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={institution.name}
        description={`Code: ${institution.code} • Slug: ${institution.slug}`}
        actions={
          <Button size="sm" asChild>
            <Link href={`/institutions/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Metadata
            </Link>
          </Button>
        }
      />

      {/* Sub-resource Management Quick Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-4">
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/institutions/${id}/departments`}>
            <GraduationCap className="mr-2 h-4 w-4" /> Departments
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/institutions/${id}/courses`}>
            <BookOpen className="mr-2 h-4 w-4" /> Courses
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/institutions/${id}/faculty`}>
            <Users className="mr-2 h-4 w-4" /> Faculty Assignments
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/institutions/${id}/branding`}>
            <Palette className="mr-2 h-4 w-4" /> Portal Branding
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/institutions/${id}/settings`}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Proctoring Settings
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/institutions/${id}/calendar`}>
            <Calendar className="mr-2 h-4 w-4" /> Academic Calendar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">General Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="outline">{institution.type}</Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">{institution.status}</Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Contact Email</span>
              <span className="font-medium">{institution.contactEmail}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-mono text-xs">{institution.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Academic Year Start</span>
              <span>{institution.academicYearStart}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Sub-Resource Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground mt-1">Active Departments</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">48</p>
              <p className="text-xs text-muted-foreground mt-1">Registered Courses</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">150</p>
              <p className="text-xs text-muted-foreground mt-1">Assigned Faculty</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">3,400</p>
              <p className="text-xs text-muted-foreground mt-1">Enrolled Candidates</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
