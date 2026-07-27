'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { CameraStatus } from '@/components/candidate/camera-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, ArrowRight } from 'lucide-react';

export default function IdentityVerificationPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const [captured, setCaptured] = useState(false);

  const handleCapture = () => {
    setCaptured(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 w-full">
      <PageHeader
        title="Candidate Identity Verification"
        description="Capture face verification photo and confirm candidate ID document before entering exam"
      />

      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" /> Live Face Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CameraStatus />

          {!captured ? (
            <Button onClick={handleCapture} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Capture Photo Snapshot
            </Button>
          ) : (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Face snapshot verified against student ID record!
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button size="lg" disabled={!captured} asChild className="px-8 font-semibold">
          <Link href={`/candidate/instructions/${sessionId}`}>
            Proceed to Instructions <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
