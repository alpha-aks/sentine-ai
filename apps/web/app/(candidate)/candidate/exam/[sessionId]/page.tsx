'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { SubmissionProvider, useSubmission } from '@/components/submission/SubmissionProvider';
import { AnswerController, QuestionData } from '@/components/submission/AnswerController';
import { SubmissionFooter } from '@/components/submission/SubmissionFooter';
import { AnswerProgress } from '@/components/submission/AnswerProgress';
import { QuestionStatusBadge } from '@/components/submission/QuestionStatusBadge';
import { SubmissionStatusBadge } from '@/components/submission/SubmissionStatusBadge';
import { SubmissionLoading } from '@/components/submission/SubmissionLoading';
import { SubmissionError } from '@/components/submission/SubmissionError';
import { SubmissionLockScreen } from '@/components/submission/SubmissionLockScreen';
import { DraftRecoveryDialog } from '@/components/submission/DraftRecoveryDialog';
import { UnsavedChangesDialog } from '@/components/submission/UnsavedChangesDialog';
import { useSubmissionStore } from '@/store/submission-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, FileCheck, Bookmark } from 'lucide-react';

const MOCK_EXAM_QUESTIONS: QuestionData[] = [
  {
    questionId: 'q1',
    type: 'SINGLE_CHOICE',
    text: 'Which data structure provides an average time complexity of O(1) for search, insert, and delete operations?',
    options: ['Binary Search Tree', 'Hash Table', 'Doubly Linked List', 'Red-Black Tree']
  },
  {
    questionId: 'q2',
    type: 'MULTIPLE_CHOICE',
    text: 'Select all garbage collection algorithms commonly utilized in modern JVM runtimes:',
    options: ['Z Garbage Collector (ZGC)', 'G1 Garbage Collector', 'Parallel GC', 'A* Search Collector']
  },
  {
    questionId: 'q3',
    type: 'TRUE_FALSE',
    text: 'In relational database management systems, ACID compliance guarantees isolation between concurrent transactions.'
  },
  {
    questionId: 'q4',
    type: 'SHORT_ANSWER',
    text: 'Define the term "Idempotency" in RESTful HTTP API architecture.'
  },
  {
    questionId: 'q5',
    type: 'LONG_ANSWER',
    text: 'Explain the architectural differences between Dijkstra algorithm and A* search in graph traversal, including heuristic admissible properties.'
  },
  {
    questionId: 'q6',
    type: 'NUMERICAL',
    text: 'Calculate the maximum number of nodes in a complete binary tree of height 5.'
  },
  {
    questionId: 'q7',
    type: 'PROGRAMMING',
    text: 'Write a TypeScript function to reverse a singly linked list in-place.'
  },
  {
    questionId: 'q8',
    type: 'FILE_UPLOAD',
    text: 'Upload your system architectural diagram PDF for the SentinelAI distributed consensus engine.'
  },
  {
    questionId: 'q9',
    type: 'MATCHING',
    text: 'Match each network protocol with its corresponding OSI transport or application layer role:',
    pairs: [
      { left: 'HTTPS', rightOptions: ['Port 443 Application', 'Port 80 HTTP', 'Port 22 SSH'] },
      { left: 'DNS', rightOptions: ['UDP/TCP Port 53 Domain Name', 'Port 25 SMTP', 'Port 443 TLS'] },
      { left: 'TCP', rightOptions: ['Connection-Oriented Transport', 'Stateless Datagram', 'Link Layer'] }
    ]
  },
  {
    questionId: 'q10',
    type: 'ORDERING',
    text: 'Order the execution lifecycle phases of an HTTP Web Request in Next.js Server Components:',
    items: [
      '1. Client Browser DNS Lookup',
      '2. TLS Handshake & Connection Established',
      '3. Next.js Middleware Pipeline Execution',
      '4. React Server Component Rendering',
      '5. HTML Hydration on Client Engine'
    ]
  }
];

function ExamWorkspaceContent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { submission, isLoading, isError, error, saveDraft, restoreDraft } = useSubmission();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(5325); // 01:28:45
  const activeQuestionId = useSubmissionStore((s) => s.activeQuestionId);
  const setActiveQuestionId = useSubmissionStore((s) => s.setActiveQuestionId);
  const markedForReview = useSubmissionStore((s) => s.markedForReview);
  const filterMode = useSubmissionStore((s) => s.filterMode);
  const setFilterMode = useSubmissionStore((s) => s.setFilterMode);

  // Live Decrementing Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Proctor Monitoring Heartbeat
  useEffect(() => {
    const sendHeartbeat = () => {
      axios
        .post(`http://localhost:4008/api/v1/monitoring/candidates/${sessionId}/heartbeat`, {
          currentQuestionId: activeQuestionId || 'q1',
          status: 'IN_PROGRESS'
        })
        .catch(() => null);
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 4000);
    return () => clearInterval(heartbeatInterval);
  }, [sessionId, activeQuestionId]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading) return <SubmissionLoading />;
  if (isError || !submission) {
    return <SubmissionError message={error?.message} />;
  }

  if (submission.isLocked || submission.status === 'SUBMITTED' || submission.status === 'LOCKED') {
    return (
      <SubmissionLockScreen
        receiptId={submission.submissionId}
        submittedAt={submission.submittedAt}
        status={submission.status}
      />
    );
  }

  const currentQ = MOCK_EXAM_QUESTIONS[currentIdx];
  const answers = submission.answers || {};
  const drafts = submission.drafts || {};

  const currentAnswer = answers[currentQ.questionId]?.answerData ?? drafts[currentQ.questionId]?.answerData;

  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.keys(markedForReview).filter((k) => markedForReview[k]).length;

  const handleAutosaveDraft = (val: any) => {
    saveDraft(currentQ.questionId, currentQ.type, val).catch(() => null);
  };

  const handleNavigateQuestion = (index: number) => {
    if (index >= 0 && index < MOCK_EXAM_QUESTIONS.length) {
      setCurrentIdx(index);
      setActiveQuestionId(MOCK_EXAM_QUESTIONS[index].questionId);
    }
  };

  const uncommittedDraftsList = Object.values(drafts).filter((d) => d.isDirty);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Header Bar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">Candidate Examination Workspace</div>
            <div className="text-xs text-muted-foreground">Session ID: {sessionId}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono bg-muted/40 px-3 py-1.5 rounded-lg border">
            <Clock className="h-4 w-4 text-primary" />
            <span>Time Remaining: <strong className="text-foreground">{formatTime(timeRemainingSeconds)}</strong></span>
          </div>

          <SubmissionStatusBadge status={submission.status} isLocked={submission.isLocked} />
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left 3 Cols: Active Question Workspace */}
        <main className="lg:col-span-3 space-y-6 flex flex-col">
          <Card className="border shadow-xs bg-card flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Question {currentIdx + 1} of {MOCK_EXAM_QUESTIONS.length} — [{currentQ.type}]
              </div>

              <QuestionStatusBadge
                isAnswered={Boolean(answers[currentQ.questionId])}
                hasDraft={Boolean(drafts[currentQ.questionId])}
                isMarkedForReview={Boolean(markedForReview[currentQ.questionId])}
              />
            </div>

            <AnswerController
              key={currentQ.questionId}
              question={currentQ}
              initialValue={currentAnswer}
              onAutosaveDraft={handleAutosaveDraft}
              disabled={submission.isLocked}
            />
          </Card>
        </main>

        {/* Right 1 Col: Question Navigator Matrix */}
        <aside className="space-y-6">
          <Card className="border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Question Matrix</span>
                <span className="text-xs text-muted-foreground">{answeredCount}/{MOCK_EXAM_QUESTIONS.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <AnswerProgress
                answeredCount={answeredCount}
                totalQuestions={MOCK_EXAM_QUESTIONS.length}
                reviewCount={reviewCount}
              />

              <div className="grid grid-cols-5 gap-2 pt-2">
                {MOCK_EXAM_QUESTIONS.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isAnswered = Boolean(answers[q.questionId]);
                  const isMarked = Boolean(markedForReview[q.questionId]);

                  return (
                    <button
                      key={q.questionId}
                      onClick={() => handleNavigateQuestion(idx)}
                      className={`h-9 rounded-md border text-xs font-bold transition-all ${
                        isCurrent
                          ? 'ring-2 ring-primary border-primary bg-primary text-primary-foreground'
                          : isMarked
                          ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                          : isAnswered
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col gap-2 text-[11px] text-muted-foreground border-t">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-emerald-500/20 border border-emerald-500/40 inline-block" />
                  <span>Answered Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-amber-500/20 border border-amber-500/40 inline-block" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-muted/40 border border-border inline-block" />
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Sticky Bottom Action Footer */}
      <SubmissionFooter
        currentQuestionId={currentQ.questionId}
        hasPrevious={currentIdx > 0}
        hasNext={currentIdx < MOCK_EXAM_QUESTIONS.length - 1}
        onPrevious={() => handleNavigateQuestion(currentIdx - 1)}
        onNext={() => handleNavigateQuestion(currentIdx + 1)}
        onReviewSubmit={() => router.push(`/candidate/exam/${sessionId}/review`)}
        disabled={submission.isLocked}
      />

      {/* Dialog Modals */}
      <DraftRecoveryDialog
        uncommittedCount={uncommittedDraftsList.length}
        onRestore={() => {
          uncommittedDraftsList.forEach((d) => restoreDraft(d.questionId));
        }}
        onDiscard={() => null}
      />
      <UnsavedChangesDialog
        onConfirmLeave={() => null}
        onSaveAndLeave={() => null}
      />
    </div>
  );
}

export default function CandidateExamSessionPage() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || 'sess_100';

  return (
    <SubmissionProvider submissionId={`sub_${sessionId}`}>
      <ExamWorkspaceContent sessionId={sessionId} />
    </SubmissionProvider>
  );
}
