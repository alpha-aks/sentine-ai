'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck } from 'lucide-react';

export default function CandidateWaitingRoomPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <Clock className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Candidate Waiting Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your identity check and system validation are complete. Please wait for the proctor to launch your exam session.
          </p>

          <div className="rounded-lg border bg-muted/40 p-4 text-xs text-left space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Pre-exam System Status:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>Webcam & Microphone connected</li>
              <li>Single display verified</li>
              <li>Lockdown browser enforcement ready</li>
            </ul>
          </div>

          <Button disabled className="w-full">
            Waiting for Proctor...
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
