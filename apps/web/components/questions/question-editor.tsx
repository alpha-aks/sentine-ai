'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QuestionEntity } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CodeEditor } from './code-editor';
import { HelpCircle, Plus, Trash2, Save, Loader2, Award } from 'lucide-react';

const questionFormSchema = z.object({
  title: z.string().min(3, 'Question title must be at least 3 characters'),
  body: z.string().min(5, 'Question body prompt is required'),
  type: z.enum([
    'MCQ_SINGLE',
    'MCQ_MULTIPLE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'SHORT_ANSWER',
    'LONG_ANSWER',
    'NUMERICAL',
    'CODE_SNIPPET',
    'FILE_UPLOAD',
    'MATCHING',
    'ORDERING'
  ]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  marks: z.coerce.number().min(1, 'Marks must be at least 1'),
  negativeMarks: z.coerce.number().min(0),
  explanation: z.string().optional()
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionEditorProps {
  initialValues?: Partial<QuestionEntity>;
  onSubmit: (values: QuestionFormValues, extraData: any) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function QuestionEditor({ initialValues, onSubmit, isLoading, isEdit }: QuestionEditorProps) {
  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean; explanation?: string }>>(
    initialValues?.options?.length
      ? initialValues.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect, explanation: o.explanation || '' }))
      : [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false }
        ]
  );

  const [codeLanguage, setCodeLanguage] = useState(initialValues?.codeLanguage || 'python');
  const [codeTemplate, setCodeTemplate] = useState(initialValues?.codeTemplate || 'def solution():\n    # Write your code here\n    pass');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: initialValues?.title || '',
      body: initialValues?.body || '',
      type: initialValues?.type || 'MCQ_SINGLE',
      difficulty: initialValues?.difficulty || 'MEDIUM',
      marks: initialValues?.marks || 1,
      negativeMarks: initialValues?.negativeMarks || 0,
      explanation: initialValues?.explanation || ''
    }
  });

  const selectedType = watch('type');

  const handleAddOption = () => {
    setOptions([...options, { text: `Option ${String.fromCharCode(65 + options.length)}`, isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: string, val: any) => {
    const updated = [...options];
    if (field === 'isCorrect' && selectedType === 'MCQ_SINGLE') {
      updated.forEach((o, i) => (o.isCorrect = i === index));
    } else {
      (updated[index] as any)[field] = val;
    }
    setOptions(updated);
  };

  const handleFormSubmit = async (values: QuestionFormValues) => {
    await onSubmit(values, {
      options: selectedType.startsWith('MCQ') || selectedType === 'TRUE_FALSE' ? options : [],
      codeLanguage,
      codeTemplate
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> Question Specification & Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Question Title *</Label>
              <Input id="title" placeholder="Binary Search Tree Insertion" error={errors.title?.message} {...register('title')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Question Type *</Label>
              <select
                id="type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                {...register('type')}
              >
                <option value="MCQ_SINGLE">Multiple Choice (Single Answer)</option>
                <option value="MCQ_MULTIPLE">Multiple Choice (Multiple Answers)</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SHORT_ANSWER">Short Answer Text</option>
                <option value="LONG_ANSWER">Long Essay Answer</option>
                <option value="NUMERICAL">Numerical Input</option>
                <option value="CODE_SNIPPET">Code Programming Problem</option>
                <option value="FILE_UPLOAD">File Upload Answer</option>
                <option value="MATCHING">Matching Pairs</option>
                <option value="ORDERING">Ordering Sequence</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Question Text Body (Markdown / LaTeX Supported) *</Label>
            <Textarea id="body" rows={4} placeholder="Given a root node of a Binary Search Tree..." error={errors.body?.message} {...register('body')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <select
                id="difficulty"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                {...register('difficulty')}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">Positive Marks *</Label>
              <Input id="marks" type="number" min={1} error={errors.marks?.message} {...register('marks')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negativeMarks">Negative Penalty Marks *</Label>
              <Input id="negativeMarks" type="number" min={0} step={0.25} error={errors.negativeMarks?.message} {...register('negativeMarks')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {(selectedType === 'MCQ_SINGLE' || selectedType === 'MCQ_MULTIPLE' || selectedType === 'TRUE_FALSE') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Answer Choice Options
            </CardTitle>
            <Button variant="outline" size="sm" type="button" onClick={handleAddOption}>
              <Plus className="h-4 w-4 mr-1" /> Add Option
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-md border bg-background">
                <Checkbox
                  checked={opt.isCorrect}
                  onCheckedChange={(checked) => handleOptionChange(idx, 'isCorrect', Boolean(checked))}
                />
                <Input
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                  placeholder={`Option ${idx + 1}...`}
                  className="flex-1"
                />
                {options.length > 1 && (
                  <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveOption(idx)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedType === 'CODE_SNIPPET' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Code Problem Starter Template</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeEditor
              language={codeLanguage}
              onLanguageChange={setCodeLanguage}
              code={codeTemplate}
              onCodeChange={setCodeTemplate}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Explanation & Solution Hint</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea id="explanation" rows={3} placeholder="Detailed explanation displayed after submission..." {...register('explanation')} />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isEdit ? 'Update Question Specification' : 'Save Question Specification'}
        </Button>
      </div>
    </form>
  );
}
