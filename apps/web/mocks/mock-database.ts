import { MOCK_DEV_USERS, MockAuthUser } from './data/auth.mock';
import { MOCK_INSTITUTIONS, MOCK_DEPARTMENTS, MOCK_COURSES, MOCK_PROGRAMS, MOCK_BATCHES } from './data/institutions.mock';
import { MOCK_USERS, MOCK_ROLES, MOCK_PERMISSIONS, MOCK_INVITATIONS } from './data/users.mock';
import { MOCK_EXAMS } from './data/exams.mock';
import { MOCK_QUESTIONS, MOCK_QUESTION_CATEGORIES, MOCK_QUESTION_TAGS, MOCK_QUESTION_POOLS } from './data/questions.mock';
import { MOCK_CANDIDATE_SESSIONS, MOCK_VIOLATIONS } from './data/sessions.mock';
import { MOCK_AI_ANALYTICS_EVIDENCE, MOCK_DASHBOARD_STATS } from './data/analytics.mock';

class MockDatabase {
  private static instance: MockDatabase;

  public currentUserRole: string = 'CANDIDATE';
  public customUser: MockAuthUser | null = null;
  public authUsers = { ...MOCK_DEV_USERS };
  public users = [...MOCK_USERS];
  public roles = [...MOCK_ROLES];
  public permissions = [...MOCK_PERMISSIONS];
  public invitations = [...MOCK_INVITATIONS];
  public institutions = [...MOCK_INSTITUTIONS];
  public departments = [...MOCK_DEPARTMENTS];
  public courses = [...MOCK_COURSES];
  public programs = [...MOCK_PROGRAMS];
  public batches = [...MOCK_BATCHES];
  public exams = [...MOCK_EXAMS];
  public questions = [...MOCK_QUESTIONS];
  public categories = [...MOCK_QUESTION_CATEGORIES];
  public tags = [...MOCK_QUESTION_TAGS];
  public pools = [...MOCK_QUESTION_POOLS];
  public sessions = [...MOCK_CANDIDATE_SESSIONS];
  public violations = [...MOCK_VIOLATIONS];
  public evidence = [...MOCK_AI_ANALYTICS_EVIDENCE];
  public stats = { ...MOCK_DASHBOARD_STATS };

  private constructor() {}

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  public getCurrentUser(): MockAuthUser {
    if (this.customUser) {
      return this.customUser;
    }
    return (
      this.authUsers[this.currentUserRole] ||
      this.authUsers.CANDIDATE ||
      this.authUsers.SUPER_ADMIN ||
      this.authUsers.EXAM_ADMIN ||
      Object.values(this.authUsers)[0]
    );
  }

  public setCustomUser(user: Partial<MockAuthUser>): MockAuthUser {
    const base = this.getCurrentUser();
    this.customUser = {
      ...base,
      ...user,
      id: user.id || base.id,
      userId: user.userId || base.userId,
      email: user.email || base.email,
      fullName: user.fullName || base.fullName,
      role: user.role || base.role
    };
    return this.customUser;
  }

  public switchRole(roleKey: string): MockAuthUser {
    this.customUser = null;
    if (this.authUsers[roleKey]) {
      this.currentUserRole = roleKey;
    }
    return this.getCurrentUser();
  }

  public resetData(): void {
    this.customUser = null;
    this.authUsers = { ...MOCK_DEV_USERS };
    this.users = [...MOCK_USERS];
    this.roles = [...MOCK_ROLES];
    this.permissions = [...MOCK_PERMISSIONS];
    this.invitations = [...MOCK_INVITATIONS];
    this.institutions = [...MOCK_INSTITUTIONS];
    this.departments = [...MOCK_DEPARTMENTS];
    this.courses = [...MOCK_COURSES];
    this.programs = [...MOCK_PROGRAMS];
    this.batches = [...MOCK_BATCHES];
    this.exams = [...MOCK_EXAMS];
    this.questions = [...MOCK_QUESTIONS];
    this.categories = [...MOCK_QUESTION_CATEGORIES];
    this.tags = [...MOCK_QUESTION_TAGS];
    this.pools = [...MOCK_QUESTION_POOLS];
    this.sessions = [...MOCK_CANDIDATE_SESSIONS];
    this.violations = [...MOCK_VIOLATIONS];
    this.evidence = [...MOCK_AI_ANALYTICS_EVIDENCE];
  }
}

export const mockDb = MockDatabase.getInstance();
