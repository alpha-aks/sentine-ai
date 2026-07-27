'use client';

import React from 'react';
import { QuestionEntity } from '@/types/question';
import { CandidateQuestionAnswer } from '@/types/candidate';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, Code2, Upload } from 'lucide-react';
import { TypeBadge } from '@/components/questions/type-badge';

interface QuestionRendererProps {
  question: QuestionEntity;
  answer?: CandidateQuestionAnswer;
  onAnswerChange: (updated: Partial<CandidateQuestionAnswer>) => void;
}

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  const selectedOption = answer?.selectedOptionId || null;
  const selectedOptions = answer?.selectedOptionIds || [];
  const textVal = answer?.textAnswer || '';
  const codeVal = answer?.codeAnswer || question.codeTemplate || '';

  const handleSingleSelect = (optText: string) => {
    onAnswerChange({ selectedOptionId: optText });
  };

  const handleMultiSelect = (optText: string, checked: boolean) => {
    const updated = checked
      ? [...selectedOptions, optText]
      : selectedOptions.filter((o) => o !== optText);
    onAnswerChange({ selectedOptionIds: updated });
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <TypeBadge type={question.type} />
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

        {(question.type === 'MCQ_SINGLE' || question.type === 'TRUE_FALSE') && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select One Choice:</label>
            {question.options?.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => handleSingleSelect(opt.text)}
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedOption === opt.text ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-muted/40'
                }`}
              >
                <Checkbox checked={selectedOption === opt.text} />
                <span className="text-sm">{opt.text}</span>
              </div>
            ))}
          </div>
        )}

        {question.type === 'MCQ_MULTIPLE' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select All That Apply:</label>
            {question.options?.map((opt, idx) => {
              const isChecked = selectedOptions.includes(opt.text);
              return (
                <div
                  key={idx}
                  onClick={() => handleMultiSelect(opt.text, !isChecked)}
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    isChecked ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-muted/40'
                  }`}
                >
                  <Checkbox checked={isChecked} />
                  <span className="text-sm">{opt.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {(question.type === 'SHORT_ANSWER' || question.type === 'NUMERICAL' || question.type === 'FILL_BLANK') && (
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type Your Response:</label>
            <Input
              value={textVal}
              onChange={(e) => onAnswerChange({ textAnswer: e.target.value })}
              placeholder="Enter exact response..."
            />
          </div>
        )}

        {question.type === 'LONG_ANSWER' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Essay Answer:</label>
            <Textarea
              rows={8}
              value={textVal}
              onChange={(e) => onAnswerChange({ textAnswer: e.target.value })}
              placeholder="Write your detailed answer response..."
            />
          </div>
        )}

        {question.type === 'CODE_SNIPPET' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-primary" /> Code Solution ({question.codeLanguage || 'python'}):
            </label>
            <Textarea
              rows={10}
              value={codeVal}
              onChange={(e) => onAnswerChange({ codeAnswer: e.target.value })}
              className="font-mono text-xs leading-relaxed bg-muted/40"
            />
          </div>
        )}

        {question.type === 'FILE_UPLOAD' && (
          <div className="p-8 rounded-md border border-dashed text-center space-y-2">
            <Upload className="h-10 w-10 text-primary mx-auto" />
            <div className="text-sm font-semibold">Upload File Submission</div>
            <div className="text-xs text-muted-foreground">PDF, DOCX, ZIP files up to 10MB</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
