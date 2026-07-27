'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { fullName: string; email: string; role: string; specialization?: string }) => Promise<void>;
  initialData?: { fullName: string; email: string; role: string; specialization?: string } | null;
}

export function FacultyDialog({ open, onOpenChange, onSubmit, initialData }: FacultyDialogProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [role, setRole] = useState(initialData?.role || 'Professor');
  const [specialization, setSpecialization] = useState(initialData?.specialization || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName);
      setEmail(initialData.email);
      setRole(initialData.role);
      setSpecialization(initialData.specialization || '');
    } else {
      setFullName('');
      setEmail('');
      setRole('Professor');
      setSpecialization('');
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ fullName, email, role, specialization });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Faculty Assignment' : 'Assign Faculty Member'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fac-name">Full Name *</Label>
            <Input id="fac-name" placeholder="Dr. Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fac-email">Email Address *</Label>
            <Input id="fac-email" type="email" placeholder="jane.doe@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fac-role">Faculty Role *</Label>
            <Input id="fac-role" placeholder="Professor / Proctor Supervisor" value={role} onChange={(e) => setRole(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fac-spec">Specialization</Label>
            <Input id="fac-spec" placeholder="Artificial Intelligence / Data Structures" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Assignment' : 'Assign Faculty'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
