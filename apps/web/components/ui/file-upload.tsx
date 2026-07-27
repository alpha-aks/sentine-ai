'use client';

import * as React from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { Button } from './button';
import { formatBytes } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number;
  selectedFile?: File | null;
  onClear?: () => void;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = '*/*',
  maxSizeBytes = 25 * 1024 * 1024,
  selectedFile,
  onClear,
  className
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeBytes) {
      setError(`File exceeds maximum size of ${formatBytes(maxSizeBytes)}`);
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/40 p-6 text-center hover:bg-muted/70 transition-colors"
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click to upload file</p>
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {formatBytes(maxSizeBytes)}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <File className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
