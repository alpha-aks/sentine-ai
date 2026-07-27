'use client';

import React, { useState } from 'react';
import { ExamScheduleEntity, LateEntryPolicy } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Save, Loader2 } from 'lucide-react';

interface SchedulePickerProps {
  schedule?: ExamScheduleEntity;
  onSave: (schedule: Partial<ExamScheduleEntity>) => Promise<void>;
  isLoading?: boolean;
}

export function SchedulePicker({ schedule, onSave, isLoading }: SchedulePickerProps) {
  const [startTime, setStartTime] = useState(
    schedule?.startTime ? new Date(schedule.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState(
    schedule?.endTime
      ? new Date(schedule.endTime).toISOString().slice(0, 16)
      : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [timezone, setTimezone] = useState(schedule?.timezone || 'UTC');
  const [lateEntryPolicy, setLateEntryPolicy] = useState<LateEntryPolicy>(schedule?.lateEntryPolicy || 'GRACE_PERIOD');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(schedule?.gracePeriodMinutes || 15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      timezone,
      lateEntryPolicy,
      gracePeriodMinutes: Number(gracePeriodMinutes)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Examination Time Window
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Exam Window Start *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Exam Window End *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="timezone"
                  placeholder="UTC"
                  className="pl-9"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateEntryPolicy">Late Join Policy *</Label>
              <select
                id="lateEntryPolicy"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={lateEntryPolicy}
                onChange={(e) => setLateEntryPolicy(e.target.value as LateEntryPolicy)}
              >
                <option value="STRICT_NO_LATE">Strict — No Late Join Allowed</option>
                <option value="GRACE_PERIOD">Grace Period Allowed</option>
                <option value="ALLOWED_WITH_PENALTY">Allowed With Penalty</option>
              </select>
            </div>
          </div>

          {lateEntryPolicy === 'GRACE_PERIOD' && (
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="gracePeriodMinutes">Grace Period (Minutes) *</Label>
              <Input
                id="gracePeriodMinutes"
                type="number"
                min={1}
                max={60}
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Exam Schedule
        </Button>
      </div>
    </form>
  );
}
