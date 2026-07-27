'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save, Loader2 } from 'lucide-react';

interface InstructionEditorProps {
  initialInstructions?: string;
  onSave: (instructions: string) => Promise<void>;
  isLoading?: boolean;
}

export function InstructionEditor({ initialInstructions = '', onSave, isLoading }: InstructionEditorProps) {
  const [instructions, setInstructions] = useState(
    initialInstructions ||
      `1. Ensure your webcam and microphone are connected and functioning before starting.\n2. Do not leave the exam window or switch tabs during the assessment.\n3. Ensure you are in a quiet, well-lit room with no third parties present.\n4. Submissions are final once confirmed or upon time expiration.`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(instructions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Candidate Instructions & Rules of Conduct
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={10}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Write clear examination rules and code of conduct for examinees..."
            className="font-mono text-sm leading-relaxed"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Candidate Instructions
        </Button>
      </div>
    </form>
  );
}
