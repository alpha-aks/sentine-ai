'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; code: string; headName?: string; contactEmail?: string }) => Promise<void>;
}

export function DepartmentDialog({ open, onOpenChange, onSubmit }: DepartmentDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [headName, setHeadName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, code: code.toUpperCase(), headName, contactEmail });
      setName('');
      setCode('');
      setHeadName('');
      setContactEmail('');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Department creation failed', err);
      setError(err.message || 'Failed to create department. Please check parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Academic Department</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dept-name">Department Name *</Label>
            <Input id="dept-name" placeholder="Computer Science" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-code">Department Code *</Label>
            <Input id="dept-code" placeholder="CS" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-head">Department Head</Label>
            <Input id="dept-head" placeholder="Dr. Alan Turing" value={headName} onChange={(e) => setHeadName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-email">Contact Email</Label>
            <Input id="dept-email" type="email" placeholder="cs@university.edu" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
