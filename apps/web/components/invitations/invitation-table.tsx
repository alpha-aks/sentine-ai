'use client';

import React from 'react';
import { InvitationEntity } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, XCircle, Clock } from 'lucide-react';

interface InvitationTableProps {
  invitations: InvitationEntity[];
  onResend: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const statusBadgeVariant: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  EXPIRED: 'bg-muted text-muted-foreground border-border',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20'
};

export function InvitationTable({ invitations, onResend, onCancel }: InvitationTableProps) {
  return (
    <div className="rounded-md border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="p-4">Recipient Email</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
              <th className="p-4">Expires</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invitations.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                <td className="p-4 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> {inv.email}
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="font-mono text-xs">
                    {inv.role}
                  </Badge>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{inv.department || 'General'}</td>
                <td className="p-4">
                  <Badge variant="outline" className={`text-xs ${statusBadgeVariant[inv.status] || ''}`}>
                    {inv.status}
                  </Badge>
                </td>
                <td className="p-4 text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(inv.expiresAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {inv.status === 'PENDING' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onResend(inv.id)}>
                          <RefreshCw className="h-4 w-4 mr-1" /> Resend
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onCancel(inv.id)} className="text-destructive">
                          <XCircle className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
