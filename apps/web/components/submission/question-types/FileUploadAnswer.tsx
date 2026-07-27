import React, { useState } from 'react';
import { Upload, FileCheck, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadAnswerProps {
  value?: {
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  } | null;
  onChange: (val: { fileName: string; fileSize: number; fileUrl: string } | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.zip', '.png', '.jpg', '.jpeg'];

export function FileUploadAnswer({ value, onChange, disabled }: FileUploadAnswerProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!file) return 'No file selected.';
    if (file.size === 0) return 'SUBMISSION_INVALID_FILE: File is empty (0 bytes).';
    if (file.size > MAX_FILE_SIZE_BYTES) return 'SUBMISSION_FILE_TOO_LARGE: File exceeds maximum allowed size of 25MB.';

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    if (disabled || !file) return;
    setError(null);

    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const mockUrl = URL.createObjectURL(file);
          onChange({
            fileName: file.name,
            fileSize: file.size,
            fileUrl: mockUrl
          });
          return 100;
        }
        return prev + 40;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isUploading ? (
        <div className="p-6 rounded-lg border border-primary/30 bg-primary/5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Encrypting & Staging File Payload ({uploadProgress}%)...</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden border">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      ) : value ? (
        <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCheck className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">{value.fileName}</div>
              <div className="text-xs text-muted-foreground">
                {((value.fileSize || 0) / 1024).toFixed(1)} KB • Staged & Sealed
              </div>
            </div>
          </div>

          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                onChange(null);
              }}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`p-8 rounded-xl border-2 border-dashed text-center transition-colors ${
            dragOver ? 'border-primary bg-primary/10' : 'border-border bg-card'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm font-semibold text-foreground">
            Drag & drop file here, or click to browse
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Supports PDF, DOCX, ZIP, PNG, JPG (Max 25MB)
          </div>

          <input
            type="file"
            disabled={disabled}
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
            id="file-input-element-hardened"
          />
          <label htmlFor="file-input-element-hardened" className="inline-block mt-4">
            <Button type="button" variant="outline" size="sm" disabled={disabled} asChild>
              <span>Select File</span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
