import { InvitationEntity } from '@/types/user';
import { UserRole } from '@sentinel-ai/types';

let invitationStore: InvitationEntity[] = [
  {
    id: 'inv_101',
    invitationId: 'inv_101',
    email: 'sarah.connor@stanford.edu',
    role: 'PROCTOR_SUPERVISOR',
    institutionId: 'inst_default',
    department: 'Computer Science',
    invitedBy: 'admin@sentinel.ai',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'inv_102',
    invitationId: 'inv_102',
    email: 'alan.turing@mit.edu',
    role: 'EXAM_ADMIN',
    institutionId: 'inst_default',
    department: 'Mathematics',
    invitedBy: 'admin@sentinel.ai',
    status: 'ACCEPTED',
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inv_103',
    invitationId: 'inv_103',
    email: 'grace.hopper@navy.mil',
    role: 'COMPLIANCE_OFFICER',
    institutionId: 'inst_default',
    department: 'Cybersecurity',
    invitedBy: 'admin@sentinel.ai',
    status: 'EXPIRED',
    expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
  }
];

class InvitationService {
  async getInvitations(): Promise<InvitationEntity[]> {
    return [...invitationStore];
  }

  async inviteUser(input: { email: string; role: UserRole; institutionId: string; department?: string }): Promise<InvitationEntity> {
    const existing = invitationStore.find((i) => i.email.toLowerCase() === input.email.toLowerCase() && i.status === 'PENDING');
    if (existing) {
      throw new Error(`A pending invitation already exists for ${input.email}`);
    }

    const newId = `inv_${Date.now()}`;
    const newInvitation: InvitationEntity = {
      id: newId,
      invitationId: newId,
      email: input.email.toLowerCase().trim(),
      role: input.role,
      institutionId: input.institutionId,
      department: input.department,
      invitedBy: 'admin@sentinel.ai',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    invitationStore.unshift(newInvitation);
    return newInvitation;
  }

  async resendInvitation(id: string): Promise<InvitationEntity> {
    const idx = invitationStore.findIndex((i) => i.id === id || i.invitationId === id);
    if (idx === -1) {
      throw new Error(`Invitation with ID ${id} not found`);
    }
    invitationStore[idx] = {
      ...invitationStore[idx],
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    return invitationStore[idx];
  }

  async cancelInvitation(id: string): Promise<void> {
    const idx = invitationStore.findIndex((i) => i.id === id || i.invitationId === id);
    if (idx !== -1) {
      invitationStore[idx].status = 'CANCELLED';
    }
  }
}

export const invitationService = new InvitationService();
