'use client';

import React from 'react';
import { QuestionEntity } from '@/types/question';
import { useCandidateStore } from '@/store/candidate-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

interface QuestionPaletteProps {
  questions: QuestionEntity[];
}

export function QuestionPalette({ questions }: QuestionPaletteProps) {
  const { currentQuestionIndex, setQuestionIndex, answers, markedQuestionIds } = useCandidateStore();

  const answeredCount = Object.values(answers).filter((a) => a.isAnswered).length;
  const markedCount = markedQuestionIds.length;
  const totalCount = questions.length;
  const unansweredCount = Math.max(0, totalCount - answeredCount);

  return (
    <Card className="h-full border-l rounded-none shadow-none flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" /> Question Palette Navigator
        </CardTitle>

        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Marked ({markedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            <span>Unanswered ({unansweredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span>Current</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const ans = answers[q.id];
            const isCurrent = idx === currentQuestionIndex;
            const isMarked = markedQuestionIds.includes(q.id);
            const isAnswered = Boolean(ans?.isAnswered);

            let statusClasses = 'bg-card text-foreground border-border hover:bg-muted/50';
            if (isCurrent) {
              statusClasses = 'bg-primary text-primary-foreground border-primary font-bold ring-2 ring-primary/40';
            } else if (isMarked) {
              statusClasses = 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-semibold';
            } else if (isAnswered) {
              statusClasses = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-semibold';
            }

            return (
              <button
                key={q.id}
                onClick={() => setQuestionIndex(idx)}
                className={`h-9 w-full rounded-md border text-xs font-mono transition-all flex items-center justify-center relative ${statusClasses}`}
              >
                {idx + 1}
                {isMarked && (
                  <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
