import React, { useState } from 'react';
import { Code, FileCode } from 'lucide-react';

interface ProgrammingAnswerProps {
  value?: {
    code?: string;
    language?: string;
  } | string;
  onChange: (val: { code: string; language: string; lineCount: number }) => void;
  disabled?: boolean;
}

export function ProgrammingAnswer({ value, onChange, disabled }: ProgrammingAnswerProps) {
  const initialCode = typeof value === 'string' ? value : value?.code || '';
  const initialLang = typeof value === 'object' && value?.language ? value.language : 'typescript';

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLang);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const lineCount = newCode ? newCode.split('\n').length : 0;
    onChange({ code: newCode, language, lineCount });
  };

  const handleLangChange = (newLang: string) => {
    setLanguage(newLang);
    const lineCount = code ? code.split('\n').length : 0;
    onChange({ code, language: newLang, lineCount });
  };

  const lineCount = code ? code.split('\n').length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-t-lg border border-b-0 border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Code className="h-4 w-4 text-primary" />
          <span>Code Editor</span>
        </div>

        <select
          value={language}
          disabled={disabled}
          onChange={(e) => handleLangChange(e.target.value)}
          className="bg-card text-foreground border border-border rounded-md text-xs px-2.5 py-1 focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <textarea
        rows={12}
        placeholder="// Write your code solution here..."
        value={code}
        disabled={disabled}
        onChange={(e) => handleCodeChange(e.target.value)}
        className="w-full p-4 rounded-b-lg border border-border bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <FileCode className="h-3.5 w-3.5" /> Language: <strong className="text-foreground uppercase">{language}</strong>
        </span>
        <span>{lineCount} Lines | {code.length} Characters</span>
      </div>
    </div>
  );
}
