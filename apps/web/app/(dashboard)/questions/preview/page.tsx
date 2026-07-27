'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { QuestionPreview } from '@/components/questions/question-preview';
import { QuestionEntity } from '@/types/question';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const mockDemoQuestion: QuestionEntity = {
  id: 'q_preview_demo',
  questionId: 'q_preview_demo',
  bankId: 'bank_default',
  institutionId: 'inst_default',
  type: 'CODE_SNIPPET',
  title: 'Binary Search Algorithm Implementation',
  body: 'Write an efficient function `binary_search(arr, target)` that returns the 0-based index of target if present in sorted array `arr`, or -1 if not found.',
  status: 'APPROVED',
  difficulty: 'MEDIUM',
  marks: 10,
  negativeMarks: 2,
  estimatedTimeSeconds: 300,
  hints: ['Use left and right pointers.', 'Compute mid index using integer division.'],
  explanation: 'Binary Search divides search space in half each step giving O(log N) time complexity.',
  codeLanguage: 'python',
  codeTemplate: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
  tags: ['algorithms', 'searching'],
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function QuestionBankPreviewPage() {
  const router = useRouter();
  const [question] = useState<QuestionEntity>(mockDemoQuestion);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Interface Preview Mode"
        description="Interactive simulation showing candidate test-taking experience for question types"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push('/questions')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Question Directory
          </Button>
        }
      />
      <QuestionPreview question={question} />
    </div>
  );
}
