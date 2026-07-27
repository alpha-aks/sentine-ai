declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';
import { invitationService } from '@/services/invitation.service';

describe('User & Role Management Services', () => {
  test('searchUsers returns user list structure', async () => {
    const result = await userService.searchUsers({ query: 'test' });
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('roleService returns system roles', async () => {
    const roles = await roleService.getRoles();
    expect(roles.length).toBeGreaterThan(0);
    const adminRole = roles.find((r) => r.code === 'EXAM_ADMIN');
    expect(adminRole).toBeDefined();
    expect(adminRole?.isSystem).toBe(true);
  });

  test('invitationService can invite new user and resend token', async () => {
    const testEmail = `test_${Date.now()}@sentinel.ai`;
    const inv = await invitationService.inviteUser({
      email: testEmail,
      role: 'CANDIDATE',
      institutionId: 'inst_default'
    });
    expect(inv.email).toBe(testEmail);
    expect(inv.status).toBe('PENDING');

    const resent = await invitationService.resendInvitation(inv.id);
    expect(resent.status).toBe('PENDING');
  });
});
