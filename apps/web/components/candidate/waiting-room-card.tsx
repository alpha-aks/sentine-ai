'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Building } from 'lucide-react';

interface WaitingRoomCardProps {
  examTitle: string;
  courseName: string;
  candidateName: string;
  candidateEmail: string;
  institutionName: string;
  durationMinutes: number;
}

export function WaitingRoomCard({
  examTitle,
  courseName,
  candidateName,
  candidateEmail,
  institutionName,
  durationMinutes
}: WaitingRoomCardProps) {
  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Examination Specification Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="p-3 rounded-md bg-muted/30 border space-y-1">
            <span className="text-muted-foreground uppercase font-semibold tracking-wider">Exam Title</span>
            <div className="font-bold text-sm text-foreground">{examTitle}</div>
            <div className="text-muted-foreground">{courseName}</div>
          </div>

          <div className="p-3 rounded-md bg-muted/30 border space-y-1">
            <span className="text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-primary" /> Institution & Duration
            </span>
            <div className="font-bold text-sm text-foreground">{institutionName}</div>
            <div className="text-muted-foreground">{durationMinutes} Minutes Time Limit</div>
          </div>

          <div className="p-3 rounded-md bg-muted/30 border space-y-1 sm:col-span-2">
            <span className="text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-primary" /> Verified Candidate Profile
            </span>
            <div className="font-bold text-sm text-foreground">{candidateName}</div>
            <div className="text-muted-foreground">{candidateEmail}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
