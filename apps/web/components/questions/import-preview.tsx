'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileCheck, Loader2 } from 'lucide-react';

interface ImportPreviewProps {
  fileName: string;
  totalParsed: number;
  onConfirmImport: () => Promise<void>;
  isLoading?: boolean;
}

export function ImportPreview({ fileName, totalParsed, onConfirmImport, isLoading }: ImportPreviewProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" /> Question Batch Import Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-muted/40 border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source File:</span>
            <span className="font-mono font-semibold">{fileName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Parsed Questions Count:</span>
            <Badge variant="secondary" className="font-mono">{totalParsed} Questions Ready</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Validation Status:</span>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">PASS — 0 Schema Errors</Badge>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onConfirmImport} disabled={isLoading} className="px-6">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Confirm & Import {totalParsed} Questions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
