'use client';

import React from 'react';
import { ExamEntity } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Layers, Lock, AlertTriangle } from 'lucide-react';

interface ExamPreviewProps {
  exam: ExamEntity;
}

export function ExamPreview({ exam }: ExamPreviewProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
            CANDIDATE SIMULATION PREVIEW
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" /> {exam.totalDurationMinutes} Minutes
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">{exam.title}</h1>
        <p className="text-sm text-muted-foreground">{exam.description || 'No summary description provided.'}</p>

        <div className="flex flex-wrap gap-4 text-xs pt-2">
          <span>Passing Score: <strong className="text-foreground">{exam.passingPercentage}%</strong></span>
          <span>Total Points: <strong className="text-foreground">{exam.totalPoints} pts</strong></span>
          <span>Max Attempts: <strong className="text-foreground">{exam.maxAttemptsAllowed}</strong></span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" /> Candidate Rules & Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 whitespace-pre-line font-mono leading-relaxed bg-muted/30 p-4 rounded-md border">
          {exam.configuration?.instructions ||
            `1. Keep your webcam active and face visible at all times.\n2. Do not switch tabs, open developer tools, or plug in external displays.\n3. Complete all mandatory sections before submitting.`}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Exam Section Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!exam.sections || exam.sections.length === 0) ? (
            <p className="text-sm text-muted-foreground">Default single section evaluation.</p>
          ) : (
            exam.sections.map((sec, idx) => (
              <div key={idx} className="p-3 rounded-md border bg-card flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-foreground">{sec.title}</div>
                  <div className="text-muted-foreground mt-0.5">{sec.instructions}</div>
                </div>
                <Badge variant="outline" className="font-mono">
                  {sec.durationMinutes ? `${sec.durationMinutes} mins` : 'Shared Timer'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Enforced Environment Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="p-3 rounded-md border bg-background flex items-center justify-between">
            <span>Secure Browser Lock:</span>
            <Badge variant="secondary">ENABLED</Badge>
          </div>
          <div className="p-3 rounded-md border bg-background flex items-center justify-between">
            <span>AI Computer Vision:</span>
            <Badge variant="secondary">ACTIVE</Badge>
          </div>
          <div className="p-3 rounded-md border bg-background flex items-center justify-between">
            <span>Tab Switch Detection:</span>
            <Badge variant="secondary">ENABLED</Badge>
          </div>
          <div className="p-3 rounded-md border bg-background flex items-center justify-between">
            <span>Copy/Paste Restricted:</span>
            <Badge variant="secondary">ENABLED</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
