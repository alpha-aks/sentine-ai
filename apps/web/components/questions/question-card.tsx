'use client';

import React from 'react';
import Link from 'next/link';
import { QuestionEntity } from '@/types/question';
import { TypeBadge } from './type-badge';
import { DifficultyBadge } from './difficulty-badge';
import { StatusBadge } from './status-badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Eye, ArrowRight } from 'lucide-react';

interface QuestionCardProps {
  question: QuestionEntity;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <TypeBadge type={question.type} />
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <CardTitle className="text-base font-bold line-clamp-1 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary shrink-0" /> {question.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-muted-foreground">
        <p className="line-clamp-2">{question.body}</p>
        <div className="flex items-center justify-between pt-2 border-t font-medium">
          <span>Marks: <strong className="text-foreground">{question.marks} pts</strong></span>
          <StatusBadge status={question.status} />
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t flex justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href={`/questions/${question.id}`}>
            <Eye className="mr-1 h-3.5 w-3.5" /> Preview
          </Link>
        </Button>
        <Button size="sm" asChild className="text-xs">
          <Link href={`/questions/${question.id}/edit`}>
            Edit <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
