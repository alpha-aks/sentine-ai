'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { WaitingRoomCard } from '@/components/candidate/waiting-room-card';
import { useCandidateStore } from '@/store/candidate-store';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function WaitingRoomPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { setSessionContext } = useCandidateStore();

  useEffect(() => {
    if (sessionId) {
      setSessionContext(sessionId, 'ex_101', 5400); // 90 mins
    }
  }, [sessionId, setSessionContext]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 w-full">
      <PageHeader
        title="Examination Waiting Room"
        description="Verify candidate profile details and run system hardware compatibility checks before test start"
      />

      <WaitingRoomCard
        examTitle="CS401: Advanced Algorithms & Data Structures Final Exam"
        courseName="Department of Computer Science"
        candidateName="Tanishq Sharma"
        candidateEmail="tanishq@sentinelai.io"
        institutionName="Sentinel University"
        durationMinutes={90}
      />

      <div className="flex justify-end pt-2">
        <Button size="lg" asChild className="px-8 font-semibold">
          <Link href={`/candidate/system-check/${sessionId}`}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Start System Diagnostics Check <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
