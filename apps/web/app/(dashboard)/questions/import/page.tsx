'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { FileUploader } from '@/components/questions/file-uploader';
import { ImportPreview } from '@/components/questions/import-preview';

export default function QuestionImportPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleConfirm = async () => {
    setIsImporting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      router.push('/questions');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Batch Question Import" description="Upload CSV, JSON, Markdown, or Excel files to import questions into the bank" />

      {!selectedFile ? (
        <FileUploader onFileSelect={setSelectedFile} />
      ) : (
        <ImportPreview
          fileName={selectedFile.name}
          totalParsed={12}
          onConfirmImport={handleConfirm}
          isLoading={isImporting}
        />
      )}
    </div>
  );
}
