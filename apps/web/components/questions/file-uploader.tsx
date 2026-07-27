'use client';

import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

export function FileUploader({ onFileSelect, accept = '.csv, .json, .md, .xlsx', className }: FileUploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`p-8 rounded-lg border-2 border-dashed text-center hover:border-primary/50 transition-colors bg-muted/20 ${className || ''}`}>
      <input type="file" accept={accept} onChange={handleChange} className="hidden" id="file-upload-input" />
      <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block">
        <Upload className="h-10 w-10 text-primary mx-auto" />
        <div className="text-sm font-semibold">Click to select or drag & drop questions file</div>
        <div className="text-xs text-muted-foreground">Supported formats: CSV, JSON, Markdown, Excel (.xlsx)</div>
      </label>
    </div>
  );
}
