'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Play } from 'lucide-react';
import { sessionService } from '@/services/session.service';
import { useCandidateStore } from '@/store/candidate-store';

export default function CandidateInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;
  const [agreed, setAgreed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { setSessionState } = useCandidateStore();

  const handleStartExam = async () => {
    if (!agreed) return;
    setIsStarting(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
      if (sessionId) {
        await sessionService.startSession(sessionId).catch(() => {});
      }
      setSessionState('ACTIVE');
      router.push(`/candidate/exam/${sessionId}`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 w-full">
      <PageHeader
        title="Candidate Exam Instructions & Honor Code"
        description="Review test navigation rules, AI proctoring policies, and acknowledge candidate compliance terms"
      />

      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Examination Conduct & Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 rounded-md bg-muted/30 border space-y-2">
            <h4 className="font-bold text-foreground">1. Fullscreen Lockdown & Tab Switching</h4>
            <p className="text-muted-foreground">
              The exam environment runs in mandatory full-screen mode. Switching tabs, opening secondary windows, or unfocusing the browser logs security violations.
            </p>
          </div>

          <div className="p-4 rounded-md bg-muted/30 border space-y-2">
            <h4 className="font-bold text-foreground">2. Audio & Video WebRTC Proctoring</h4>
            <p className="text-muted-foreground">
              Your webcam and microphone remain active during the entire test duration for automated AI gaze detection and proctoring logs.
            </p>
          </div>

          <div className="p-4 rounded-md bg-muted/30 border space-y-2">
            <h4 className="font-bold text-foreground">3. Navigation & Auto-Save</h4>
            <p className="text-muted-foreground">
              Responses are saved continuously to server cache. You can navigate between questions using the Question Palette or Previous / Next buttons.
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-md border bg-primary/5 border-primary/20">
            <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(Boolean(checked))} id="consent" />
            <label htmlFor="consent" className="text-xs font-semibold cursor-pointer">
              I have read, understood, and agree to adhere strictly to the examination rules and SentinelAI Honor Code.
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="lg" disabled={!agreed || isStarting} onClick={handleStartExam} className="px-8 font-semibold">
              <Play className="mr-2 h-4 w-4" /> Start Examination Environment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
