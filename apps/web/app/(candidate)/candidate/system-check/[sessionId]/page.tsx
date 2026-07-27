'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { SystemCheckCard } from '@/components/candidate/system-check-card';
import { CameraStatus } from '@/components/candidate/camera-status';
import { MicrophoneStatus } from '@/components/candidate/microphone-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function SystemCheckPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [results] = useState({
    browserSupported: true,
    browserName: 'Chrome 124.0',
    cameraAvailable: true,
    microphoneAvailable: true,
    internetConnected: true,
    downloadSpeedMbps: 45.8,
    webRtcSupported: true,
    fullscreenCapable: true,
    cookiesEnabled: true,
    localStorageEnabled: true
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 w-full">
      <PageHeader
        title="Hardware & System Diagnostics"
        description="Verify webcam preview feed, audio level meter, network latency, and browser lockdown capabilities"
      />

      <SystemCheckCard results={results} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Webcam Video Feed Test</CardTitle>
          </CardHeader>
          <CardContent>
            <CameraStatus />
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Microphone Audio Level Test</CardTitle>
          </CardHeader>
          <CardContent>
            <MicrophoneStatus />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Button size="lg" asChild className="px-8 font-semibold">
          <Link href={`/candidate/identity/${sessionId}`}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Proceed to Identity Verification <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
