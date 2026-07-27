'use client';

import React from 'react';
import { QuestionPalette } from './question-palette';
import { QuestionEntity } from '@/types/question';
import { useCandidateStore } from '@/store/candidate-store';

interface QuestionNavigatorProps {
  questions: QuestionEntity[];
}

export function QuestionNavigator({ questions }: QuestionNavigatorProps) {
  const { sidebarOpen } = useCandidateStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-72 border-l bg-card shrink-0 h-[calc(100vh-7rem)] sticky top-14">
      <QuestionPalette questions={questions} />
    </aside>
  );
}
