'use client';

import React, { useState } from 'react';
import { ExamPolicyEntity } from '@/types/exam';
import { SensitivityProfile } from '@sentinel-ai/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, Save, Loader2 } from 'lucide-react';

interface AIProctoringPanelProps {
  policy?: ExamPolicyEntity;
  onSave: (policy: Partial<ExamPolicyEntity>) => Promise<void>;
  isLoading?: boolean;
}

export function AIProctoringPanel({ policy, onSave, isLoading }: AIProctoringPanelProps) {
  const [visionMonitoring, setVisionMonitoring] = useState(policy?.visionMonitoring ?? true);
  const [behaviorMonitoring, setBehaviorMonitoring] = useState(policy?.behaviorMonitoring ?? true);
  const [collusionDetection, setCollusionDetection] = useState(policy?.collusionDetection ?? true);
  const [sensitivityProfile, setSensitivityProfile] = useState<SensitivityProfile>(policy?.sensitivityProfile || 'STANDARD');
  const [riskThresholdPercentage, setRiskThresholdPercentage] = useState(policy?.riskThresholdPercentage || 75);
  const [humanReviewRequired, setHumanReviewRequired] = useState(policy?.humanReviewRequired ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      visionMonitoring,
      behaviorMonitoring,
      collusionDetection,
      sensitivityProfile,
      riskThresholdPercentage: Number(riskThresholdPercentage),
      humanReviewRequired
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> Computer Vision & AI Proctoring Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Webcam Face & Gaze Tracking</div>
              <div className="text-xs text-muted-foreground">Enables AI facial tracking, head pose, and eye movement monitoring.</div>
            </div>
            <Switch checked={visionMonitoring} onCheckedChange={setVisionMonitoring} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Behavior & Anomalous Motion AI</div>
              <div className="text-xs text-muted-foreground">Detects phone presence, additional persons, and unauthorized objects.</div>
            </div>
            <Switch checked={behaviorMonitoring} onCheckedChange={setBehaviorMonitoring} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div>
              <div className="font-semibold text-sm">Acoustic & Speech Collusion AI</div>
              <div className="text-xs text-muted-foreground">Detects ambient voice conversations and background speech.</div>
            </div>
            <Switch checked={collusionDetection} onCheckedChange={setCollusionDetection} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <Label htmlFor="sensitivityProfile">Sensitivity Profile *</Label>
              <select
                id="sensitivityProfile"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={sensitivityProfile}
                onChange={(e) => setSensitivityProfile(e.target.value as SensitivityProfile)}
              >
                <option value="STRICT">Strict — Zero Tolerance</option>
                <option value="STANDARD">Standard — Balanced Thresholds</option>
                <option value="LOW">Low — Minimal Alert Flags</option>
                <option value="CUSTOM">Custom Parameters</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskThreshold">Suspicion Risk Flag Threshold (%) *</Label>
              <Input
                id="riskThreshold"
                type="number"
                min={10}
                max={100}
                value={riskThresholdPercentage}
                onChange={(e) => setRiskThresholdPercentage(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save AI Proctoring Parameters
        </Button>
      </div>
    </form>
  );
}
