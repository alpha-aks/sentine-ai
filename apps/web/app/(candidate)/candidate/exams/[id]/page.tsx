'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Play, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CandidateExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 w-full">
      <PageHeader
        title={`CS401: Advanced Algorithms & Data Structures Final Exam (${id})`}
        description="Comprehensive exam guidelines, proctoring security requirements, and system checks"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push('/candidate/exams')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
          </Button>
        }
      />

      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Examination Specification & Security Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 rounded-md bg-muted/30 border space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> AI Proctoring & Fullscreen Lockdown Required
            </div>
            <p className="text-muted-foreground">
              During the test session, full-screen focus is enforced. Tab switching, browser unfocusing, or secondary display usage will result in logged proctoring warnings.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="lg" asChild className="px-8 font-semibold">
              <Link href="/candidate/waiting-room/session_demo_101">
                <Play className="mr-2 h-4 w-4" /> Proceed to Waiting Room
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
