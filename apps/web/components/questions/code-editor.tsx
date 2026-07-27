'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Code2 } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
}

export function CodeEditor({ language, onLanguageChange, code, onCodeChange }: CodeEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" /> Target Programming Language
        </Label>
        <select
          className="flex h-8 w-40 rounded-md border border-input bg-background px-2 text-xs font-mono focus:outline-none"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          <option value="python">Python 3.11</option>
          <option value="javascript">Node.js ES2022</option>
          <option value="cpp">C++ 20</option>
          <option value="java">Java 17</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Starter Code / Function Stub</Label>
        <Textarea
          rows={6}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="// Function signature and boilerplate..."
          className="font-mono text-xs leading-relaxed bg-muted/40"
        />
      </div>
    </div>
  );
}
