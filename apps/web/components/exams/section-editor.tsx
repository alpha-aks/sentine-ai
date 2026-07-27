'use client';

import React, { useState } from 'react';
import { ExamSectionEntity } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Layers, Save, Loader2 } from 'lucide-react';

interface SectionEditorProps {
  sections: ExamSectionEntity[];
  onSave: (sections: ExamSectionEntity[]) => Promise<void>;
  isLoading?: boolean;
}

export function SectionEditor({ sections: initialSections, onSave, isLoading }: SectionEditorProps) {
  const [sections, setSections] = useState<ExamSectionEntity[]>(
    initialSections.length > 0
      ? initialSections
      : [
          {
            title: 'Section A: Multiple Choice Questions',
            instructions: 'Answer all 20 multiple choice questions.',
            durationMinutes: 30,
            weightPercentage: 50,
            isMandatory: true,
            isRandomized: true,
            sequenceOrder: 1
          }
        ]
  );

  const handleAddSection = () => {
    const newSeq = sections.length + 1;
    setSections([
      ...sections,
      {
        title: `Section ${String.fromCharCode(65 + sections.length)}: Problem Solving`,
        instructions: 'Read problem scenarios carefully before answering.',
        durationMinutes: 30,
        weightPercentage: 50,
        isMandatory: true,
        isRandomized: false,
        sequenceOrder: newSeq
      }
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ExamSectionEntity, val: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: val };
    setSections(updated);
  };

  const handleSave = async () => {
    await onSave(sections);
  };

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <Card key={idx} className="border shadow-xs relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Section {idx + 1}: {section.title}
            </CardTitle>
            {sections.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => handleRemoveSection(idx)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Section Title *</Label>
                <Input
                  value={section.title}
                  onChange={(e) => handleChange(idx, 'title', e.target.value)}
                  placeholder="Section A: Core Concepts"
                />
              </div>

              <div className="space-y-2">
                <Label>Section Timer (Mins)</Label>
                <Input
                  type="number"
                  min={1}
                  value={section.durationMinutes || 30}
                  onChange={(e) => handleChange(idx, 'durationMinutes', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Section Instructions</Label>
              <Input
                value={section.instructions || ''}
                onChange={(e) => handleChange(idx, 'instructions', e.target.value)}
                placeholder="Specific directions for examinees in this section..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox
                  checked={section.isMandatory}
                  onCheckedChange={(checked) => handleChange(idx, 'isMandatory', Boolean(checked))}
                />
                Mandatory Section
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox
                  checked={section.isRandomized}
                  onCheckedChange={(checked) => handleChange(idx, 'isRandomized', Boolean(checked))}
                />
                Randomize Question Order
              </label>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={handleAddSection}>
          <Plus className="mr-2 h-4 w-4" /> Add Exam Section
        </Button>

        <Button onClick={handleSave} disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Section Architecture
        </Button>
      </div>
    </div>
  );
}
