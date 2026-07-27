'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Loader2 } from 'lucide-react';

interface QuestionPoolEditorProps {
  onSave: (name: string, targetCount: number) => Promise<void>;
  isLoading?: boolean;
}

export function QuestionPoolEditor({ onSave, isLoading }: QuestionPoolEditorProps) {
  const [name, setName] = useState('');
  const [targetCount, setTargetCount] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onSave(name, Number(targetCount));
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Create Question Pool Specification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="poolName">Pool Name *</Label>
              <Input
                id="poolName"
                placeholder="Midterm Random Pool A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCount">Target Question Draw Count *</Label>
              <Input
                id="targetCount"
                type="number"
                min={1}
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Pool Specification
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
