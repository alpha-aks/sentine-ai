import assert from 'assert';
import { test, describe, beforeEach } from 'node:test';
import { UserCache } from '../cache/UserCache';
import { UserRepository } from '../db/UserRepository';
import { UserService } from '../services/UserService';

describe('User Service Suite', () => {
  let repository: UserRepository;
  let cache: UserCache;
  let service: UserService;

  beforeEach(() => {
    repository = new UserRepository();
    cache = new UserCache(300);
    service = new UserService(repository, cache);
  });

  test('1. Create User & Default Preference Generation', async () => {
    const user = await service.createUser({
      email: 'user1@university.edu',
      fullName: 'Alice Candidate',
      role: 'CANDIDATE',
      institutionId: 'inst_mit'
    });

    assert.strictEqual(user.email, 'user1@university.edu');
    assert.strictEqual(user.role, 'CANDIDATE');
    assert.strictEqual(user.status, 'ACTIVE');
    assert.ok(user.preferences);
    assert.strictEqual(user.preferences.theme, 'SYSTEM');
  });

  test('2. Update Profile & Cache Eviction', async () => {
    const created = await service.createUser({
      email: 'user2@university.edu',
      fullName: 'Bob Proctor',
      role: 'LIVE_PROCTOR',
      institutionId: 'inst_mit'
    });

    // Warm cache
    const cachedFirst = await service.getUserById(created.userId);
    assert.strictEqual(cachedFirst.fullName, 'Bob Proctor');

    // Update Profile
    const updated = await service.updateUser(created.userId, {
      fullName: 'Robert Proctor Senior',
      phoneNumber: '+1-555-0199'
    });

    assert.strictEqual(updated.fullName, 'Robert Proctor Senior');
    assert.strictEqual(updated.phoneNumber, '+1-555-0199');

    // Verify cache has updated data
    const cachedSecond = await service.getUserById(created.userId);
    assert.strictEqual(cachedSecond.fullName, 'Robert Proctor Senior');
  });

  test('3. Role Assignment & Permission Hierarchy Enforcement', async () => {
    const user = await service.createUser({
      email: 'user3@university.edu',
      fullName: 'Charlie Staff',
      role: 'CANDIDATE',
      institutionId: 'inst_mit'
    });

    // EXAM_ADMIN assigns LIVE_PROCTOR role -> Allowed
    const updatedUser = await service.assignRole(
      user.userId,
      { role: 'LIVE_PROCTOR', reason: 'Promoted to proctoring duty' },
      'admin_001',
      'EXAM_ADMIN'
    );

    assert.strictEqual(updatedUser.role, 'LIVE_PROCTOR');

    // LIVE_PROCTOR trying to assign EXAM_ADMIN -> Rejected by Hierarchy Guard
    await assert.rejects(
      async () => {
        await service.assignRole(
          user.userId,
          { role: 'EXAM_ADMIN' },
          'proctor_001',
          'LIVE_PROCTOR'
        );
      },
      (err: any) => err.message.includes('USER_FORBIDDEN_ROLE_ASSIGNMENT')
    );
  });

  test('4. Permission Overrides & Effective Permissions', async () => {
    const user = await service.createUser({
      email: 'user4@university.edu',
      fullName: 'Dave Candidate',
      role: 'CANDIDATE',
      institutionId: 'inst_mit'
    });

    const initialPerms = await service.getEffectivePermissions(user.userId);
    assert.ok(initialPerms.includes('session:start'));
    assert.strictEqual(initialPerms.includes('exam:create'), false);

    // Grant custom permission override
    const updatedPerms = await service.assignPermissionOverride(
      user.userId,
      { permission: 'exam:create', isGranted: true },
      'admin_001'
    );

    assert.ok(updatedPerms.includes('exam:create'));
  });

  test('5. Account Status Transition (Active -> Suspended)', async () => {
    const user = await service.createUser({
      email: 'user5@university.edu',
      fullName: 'Eve Candidate',
      role: 'CANDIDATE',
      institutionId: 'inst_mit'
    });

    const updated = await service.updateAccountStatus(user.userId, 'SUSPENDED', 'admin_001');
    assert.strictEqual(updated.status, 'SUSPENDED');
  });

  test('6. User Search & Pagination', async () => {
    await service.createUser({
      email: 'search1@university.edu',
      fullName: 'Frank Student',
      role: 'CANDIDATE',
      institutionId: 'inst_mit'
    });

    await service.createUser({
      email: 'search2@university.edu',
      fullName: 'Grace Proctor',
      role: 'LIVE_PROCTOR',
      institutionId: 'inst_mit'
    });

    const searchResult = await service.searchUsers({
      query: 'Student',
      role: 'CANDIDATE'
    });

    assert.strictEqual(searchResult.total, 1);
    assert.strictEqual(searchResult.items[0].email, 'search1@university.edu');
  });
});
