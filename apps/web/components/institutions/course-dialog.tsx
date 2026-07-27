'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { code: string; title: string; credits: number; description?: string }) => Promise<void>;
  initialData?: { code: string; title: string; credits: number; description?: string } | null;
}

export function CourseDialog({ open, onOpenChange, onSubmit, initialData }: CourseDialogProps) {
  const [code, setCode] = useState(initialData?.code || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [credits, setCredits] = useState(initialData?.credits || 3);
  const [description, setDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setTitle(initialData.title);
      setCredits(initialData.credits);
      setDescription(initialData.description || '');
    } else {
      setCode('');
      setTitle('');
      setCredits(3);
      setDescription('');
    }
    setError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ code: code.toUpperCase(), title, credits: Number(credits), description });
      onOpenChange(false);
    } catch (err: any) {
      console.error('Course registration failed', err);
      setError(err.message || 'Failed to register course. Please check fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Course Specification' : 'Register New Academic Course'}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="course-code">Course Code *</Label>
            <Input id="course-code" placeholder="CS101" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-title">Course Title *</Label>
            <Input id="course-title" placeholder="Introduction to Computer Science" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-credits">Credit Hours *</Label>
            <Input id="course-credits" type="number" min={1} max={12} value={credits} onChange={(e) => setCredits(Number(e.target.value))} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-desc">Course Description</Label>
            <Textarea id="course-desc" placeholder="Overview of fundamental algorithms..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Course' : 'Register Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
