'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { InvitationTable } from '@/components/invitations/invitation-table';
import { InvitationDialog } from '@/components/invitations/invitation-dialog';
import { InvitationEntity } from '@/types/user';
import { invitationService } from '@/services/invitation.service';
import { UserRole } from '@sentinel-ai/types';
import { Mail, RefreshCw } from 'lucide-react';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationEntity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchInvitations = async () => {
    try {
      const items = await invitationService.getInvitations();
      setInvitations(items);
    } catch {
      setInvitations([]);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvite = async (data: { email: string; role: UserRole; institutionId: string; department?: string }) => {
    await invitationService.inviteUser(data);
    fetchInvitations();
  };

  const handleResend = async (id: string) => {
    await invitationService.resendInvitation(id);
    fetchInvitations();
  };

  const handleCancel = async (id: string) => {
    await invitationService.cancelInvitation(id);
    fetchInvitations();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Onboarding Invitations"
        description="Dispatch onboarding email invites, track token expirations, and manage pending access"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchInvitations}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Mail className="mr-2 h-4 w-4" /> Send Invitation Email
            </Button>
          </div>
        }
      />

      <InvitationTable invitations={invitations} onResend={handleResend} onCancel={handleCancel} />

      <InvitationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleInvite} />
    </div>
  );
}
