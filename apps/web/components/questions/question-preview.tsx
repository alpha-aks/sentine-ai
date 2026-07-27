'use client';

import React, { useState } from 'react';
import { QuestionEntity } from '@/types/question';
import { TypeBadge } from './type-badge';
import { DifficultyBadge } from './difficulty-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, Code2, Upload, CheckCircle2 } from 'lucide-react';

interface QuestionPreviewProps {
  question: QuestionEntity;
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState(question.codeTemplate || '');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <TypeBadge type={question.type} />
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
          <div className="text-xs font-semibold text-foreground font-mono">
            {question.marks} Points {question.negativeMarks > 0 && <span className="text-destructive">(-{question.negativeMarks})</span>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <HelpCircle className="h-5 w-5 text-primary shrink-0" /> {question.title}
            </h2>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed mt-2 p-4 rounded-md bg-muted/30 border">
              {question.body}
            </div>
          </div>

          {(question.type === 'MCQ_SINGLE' || question.type === 'MCQ_MULTIPLE' || question.type === 'TRUE_FALSE') && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Response Choice:</label>
              {(!question.options || question.options.length === 0) ? (
                <div className="text-sm text-muted-foreground italic">No options defined for this choice question.</div>
              ) : (
                question.options.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedOption(opt.text)}
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedOption === opt.text ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox checked={selectedOption === opt.text} />
                    <span className="text-sm font-medium">{opt.text}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {(question.type === 'SHORT_ANSWER' || question.type === 'NUMERICAL') && (
            <div className="space-y-2 max-w-md">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type Your Answer:</label>
              <Input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Enter exact response..."
              />
            </div>
          )}

          {question.type === 'LONG_ANSWER' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Essay Response:</label>
              <Textarea
                rows={6}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Write your comprehensive essay response here..."
              />
            </div>
          )}

          {question.type === 'CODE_SNIPPET' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-primary" /> Code Solution ({question.codeLanguage || 'python'}):
                </label>
              </div>
              <Textarea
                rows={8}
                value={codeAnswer}
                onChange={(e) => setCodeAnswer(e.target.value)}
                className="font-mono text-xs leading-relaxed bg-muted/40"
              />
            </div>
          )}

          {question.type === 'FILE_UPLOAD' && (
            <div className="p-6 rounded-md border border-dashed text-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="text-sm font-medium">Drag & Drop file attachment or Browse</div>
              <div className="text-xs text-muted-foreground">PDF, DOCX, ZIP files up to 10MB</div>
            </div>
          )}
        </CardContent>
      </Card>

      {question.explanation && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 text-xs space-y-1">
            <strong className="text-primary flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Solution Explanation & Solution Key
            </strong>
            <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
