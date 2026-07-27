'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { questionService } from '@/services/question.service';
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';

export default function QuestionExportPage() {
  const [format, setFormat] = useState('JSON');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedCount, setExportedCount] = useState<number | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportedCount(null);
    try {
      const res = await questionService.searchQuestions({ limit: 100 });
      const questions = res.items;

      let content = '';
      let mimeType = 'text/plain';
      let extension = 'txt';

      if (format === 'JSON') {
        content = JSON.stringify(questions, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else if (format === 'CSV') {
        const headers = ['questionId', 'title', 'type', 'difficulty', 'marks', 'body'];
        const rows = questions.map((q) => [
          `"${q.questionId}"`,
          `"${q.title.replace(/"/g, '""')}"`,
          `"${q.type}"`,
          `"${q.difficulty}"`,
          q.marks,
          `"${q.body.replace(/"/g, '""')}"`
        ]);
        content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
      } else if (format === 'MARKDOWN') {
        content = `# Question Bank Export\n\n` + questions.map((q, i) => (
          `## ${i + 1}. ${q.title} (${q.type} - ${q.marks} pts)\n\n${q.body}\n`
        )).join('\n---\n\n');
        mimeType = 'text/markdown';
        extension = 'md';
      } else {
        content = JSON.stringify(questions, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentinelai_questions_export.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportedCount(questions.length);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Export Question Repository" description="Download exported questions in structured JSON, CSV, Markdown, or Excel formats" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Select Export Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Choose format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JSON">Structured JSON (.json)</SelectItem>
              <SelectItem value="CSV">Comma-Separated Values (.csv)</SelectItem>
              <SelectItem value="MARKDOWN">Markdown Document (.md)</SelectItem>
              <SelectItem value="EXCEL">Microsoft Excel Sheet (.xlsx / JSON)</SelectItem>
            </SelectContent>
          </Select>

          {exportedCount !== null && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Successfully exported and downloaded {exportedCount} questions in {format} format!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Generate & Download Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
