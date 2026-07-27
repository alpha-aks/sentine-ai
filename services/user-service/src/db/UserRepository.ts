import { Permission } from '@sentinel-ai/security';
import { UserRole } from '@sentinel-ai/types';
import {
  UserEntity,
  UserInstitutionEntity,
  UserPermissionEntity,
  UserPreferenceEntity,
  UserRoleEntity,
  UserSearchQueryDto
} from '../types/user';

export class UserRepository {
  private users: Map<string, UserEntity> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId
  private preferences: Map<string, UserPreferenceEntity> = new Map(); // userId -> Entity
  private roleHistory: Map<string, UserRoleEntity[]> = new Map(); // userId -> Entities[]
  private permissions: Map<string, Map<string, UserPermissionEntity>> = new Map(); // userId -> (permission -> Entity)
  private institutions: Map<string, UserInstitutionEntity[]> = new Map(); // userId -> Entities[]

  // --- User Profile Repository Methods ---
  public async createUser(user: UserEntity): Promise<UserEntity> {
    const emailKey = user.email.toLowerCase();
    if (this.usersByEmail.has(emailKey)) {
      throw new Error(`User with email "${user.email}" already exists`);
    }
    this.users.set(user.userId, { ...user });
    this.usersByEmail.set(emailKey, user.userId);
    return { ...user };
  }

  public async findUserById(userId: string): Promise<UserEntity | null> {
    const user = this.users.get(userId);
    return user ? { ...user } : null;
  }

  public async findUserByEmail(email: string): Promise<UserEntity | null> {
    const userId = this.usersByEmail.get(email.toLowerCase());
    if (!userId) return null;
    return this.findUserById(userId);
  }

  public async updateUser(userId: string, updates: Partial<UserEntity>): Promise<UserEntity> {
    const existing = this.users.get(userId);
    if (!existing) {
      throw new Error(`User not found: ${userId}`);
    }

    const updated: UserEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.email && updates.email.toLowerCase() !== existing.email.toLowerCase()) {
      this.usersByEmail.delete(existing.email.toLowerCase());
      this.usersByEmail.set(updates.email.toLowerCase(), userId);
    }

    this.users.set(userId, updated);
    return { ...updated };
  }

  public async deleteUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.usersByEmail.delete(user.email.toLowerCase());
      this.users.delete(userId);
      this.preferences.delete(userId);
      this.roleHistory.delete(userId);
      this.permissions.delete(userId);
      this.institutions.delete(userId);
    }
  }

  public async searchUsers(queryDto: UserSearchQueryDto): Promise<{ items: UserEntity[]; total: number }> {
    let results = Array.from(this.users.values());

    if (queryDto.role) {
      results = results.filter(u => u.role === queryDto.role);
    }

    if (queryDto.status) {
      results = results.filter(u => u.status === queryDto.status);
    }

    if (queryDto.institutionId) {
      results = results.filter(u => u.institutionId === queryDto.institutionId);
    }

    if (queryDto.query) {
      const q = queryDto.query.toLowerCase().trim();
      results = results.filter(
        u => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    results.sort((a: any, b: any) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = results.length;
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.max(1, Math.min(100, queryDto.limit || 20));
    const startIndex = (page - 1) * limit;

    const items = results.slice(startIndex, startIndex + limit).map(u => ({ ...u }));
    return { items, total };
  }

  // --- User Preferences Repository Methods ---
  public async getPreferences(userId: string): Promise<UserPreferenceEntity | null> {
    const pref = this.preferences.get(userId);
    return pref ? { ...pref } : null;
  }

  public async savePreferences(preferences: UserPreferenceEntity): Promise<UserPreferenceEntity> {
    this.preferences.set(preferences.userId, { ...preferences });
    return { ...preferences };
  }

  // --- User Role History Repository Methods ---
  public async addRoleAssignment(assignment: UserRoleEntity): Promise<UserRoleEntity> {
    if (!this.roleHistory.has(assignment.userId)) {
      this.roleHistory.set(assignment.userId, []);
    }
    const history = this.roleHistory.get(assignment.userId)!;
    history.push({ ...assignment });

    // Update user role
    const user = this.users.get(assignment.userId);
    if (user) {
      user.role = assignment.role;
      user.updatedAt = new Date().toISOString();
    }

    return { ...assignment };
  }

  public async getRoleHistory(userId: string): Promise<UserRoleEntity[]> {
    return (this.roleHistory.get(userId) || []).map(r => ({ ...r }));
  }

  // --- User Permission Override Repository Methods ---
  public async setPermission(entity: UserPermissionEntity): Promise<UserPermissionEntity> {
    if (!this.permissions.has(entity.userId)) {
      this.permissions.set(entity.userId, new Map());
    }
    const userPermMap = this.permissions.get(entity.userId)!;
    userPermMap.set(entity.permission, { ...entity });
    return { ...entity };
  }

  public async getUserPermissionOverrides(userId: string): Promise<UserPermissionEntity[]> {
    const userPermMap = this.permissions.get(userId);
    if (!userPermMap) return [];
    return Array.from(userPermMap.values()).map(p => ({ ...p }));
  }

  // --- User Institution Repository Methods ---
  public async addInstitution(membership: UserInstitutionEntity): Promise<UserInstitutionEntity> {
    if (!this.institutions.has(membership.userId)) {
      this.institutions.set(membership.userId, []);
    }
    const list = this.institutions.get(membership.userId)!;
    if (membership.isPrimary) {
      list.forEach(m => (m.isPrimary = false));
    }
    list.push({ ...membership });
    return { ...membership };
  }

  public async getUserInstitutions(userId: string): Promise<UserInstitutionEntity[]> {
    return (this.institutions.get(userId) || []).map(i => ({ ...i }));
  }

  public clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.preferences.clear();
    this.roleHistory.clear();
    this.permissions.clear();
    this.institutions.clear();
  }
}
