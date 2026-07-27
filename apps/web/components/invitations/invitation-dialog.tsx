'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole } from '@sentinel-ai/types';
import { Send, Loader2 } from 'lucide-react';

interface InvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { email: string; role: UserRole; institutionId: string; department?: string }) => Promise<void>;
}

export function InvitationDialog({ open, onOpenChange, onSubmit }: InvitationDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CANDIDATE');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ email, role, institutionId: 'inst_default', department });
      setEmail('');
      setRole('CANDIDATE');
      setDepartment('');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Invitation failed', err);
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send User Invitation</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Recipient Email Address *</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Assigned Role *</Label>
            <select
              id="invite-role"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="CANDIDATE">Candidate (Student)</option>
              <option value="LIVE_PROCTOR">Live Proctor</option>
              <option value="PROCTOR_SUPERVISOR">Proctor Supervisor</option>
              <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
              <option value="EXAM_ADMIN">Exam Administrator</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-dept">Department (Optional)</Label>
            <Input id="invite-dept" placeholder="Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Invitation Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
