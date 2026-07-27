'use client';

import React from 'react';
import { LiveExamMonitorEntity } from '@/services/proctor-monitoring.service';
import { FileSpreadsheet, Check } from 'lucide-react';

interface ExamSelectorProps {
  exams: LiveExamMonitorEntity[];
  selectedExamId: string | null;
  onSelectExam: (examId: string | null) => void;
}

export function ExamSelector({ exams, selectedExamId, onSelectExam }: ExamSelectorProps) {
  const examList = Array.isArray(exams) ? exams : (exams as any)?.items || [];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelectExam(null)}
        className={`px-3.5 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
          selectedExamId === null
            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
            : 'border-border bg-card text-muted-foreground hover:bg-accent'
        }`}
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        <span>All Active Exams ({examList.length})</span>
        {selectedExamId === null && <Check className="h-3.5 w-3.5 ml-1" />}
      </button>

      {examList.map((exam: LiveExamMonitorEntity) => {
        const isSelected = selectedExamId === exam.examId;
        return (
          <button
            key={exam.examId}
            onClick={() => onSelectExam(exam.examId)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              isSelected
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            <span>{exam.examCode}: {exam.title}</span>
            <span className="text-[10px] opacity-80 font-mono">({exam.totalCandidates} cands)</span>
            {isSelected && <Check className="h-3.5 w-3.5 ml-1" />}
          </button>
        );
      })}
    </div>
  );
}
