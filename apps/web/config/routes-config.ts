import { UserRole } from '@sentinel-ai/types';

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

export const routesConfig = {
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password'
  },
  dashboard: '/dashboard',
  institutions: '/institutions',
  departments: '/departments',
  courses: '/courses',
  faculty: '/faculty',
  programs: '/programs',
  batches: '/batches',
  users: '/users',
  roles: '/roles',
  exams: '/exams',
  questions: '/questions',
  questionBank: '/question-bank',
  candidateSessions: '/candidate-sessions',
  candidate: {
    waitingRoom: '/candidate/waiting-room',
    exam: (sessionId: string) => `/candidate/exam/${sessionId}`
  },
  profile: '/profile',
  settings: '/settings',
  reports: '/reports',
  analytics: '/analytics',
  system: {
    unauthorized: '/unauthorized',
    forbidden: '/forbidden',
    notFound: '/404'
  }
};

export const mainNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'LIVE_PROCTOR', 'COMPLIANCE_OFFICER', 'CANDIDATE']
  },
  {
    title: 'Proctor Command Center',
    href: '/dashboard/proctor',
    icon: 'Shield',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'LIVE_PROCTOR']
  },
  {
    title: 'Exams',
    href: '/exams',
    icon: 'FileSpreadsheet',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'LIVE_PROCTOR']
  },
  {
    title: 'Questions',
    href: '/questions',
    icon: 'HelpCircle',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']
  },
  {
    title: 'Question Bank',
    href: '/question-bank',
    icon: 'Database',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']
  },
  {
    title: 'Candidate Sessions',
    href: '/candidate-sessions',
    icon: 'Activity',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'LIVE_PROCTOR']
  },
  {
    title: 'Institutions',
    href: '/institutions',
    icon: 'Building2',
    roles: ['EXAM_ADMIN', 'COMPLIANCE_OFFICER']
  },
  {
    title: 'Departments',
    href: '/departments',
    icon: 'GraduationCap',
    roles: ['EXAM_ADMIN']
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: 'BookOpen',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR']
  },
  {
    title: 'Faculty & Users',
    href: '/users',
    icon: 'Users',
    roles: ['EXAM_ADMIN']
  },
  {
    title: 'Batches',
    href: '/batches',
    icon: 'Users2',
    roles: ['EXAM_ADMIN']
  },
  {
    title: 'Analytics & Reports',
    href: '/analytics',
    icon: 'BarChart3',
    roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'COMPLIANCE_OFFICER']
  },
  {
    title: 'Audit Reports',
    href: '/reports',
    icon: 'FileText',
    roles: ['COMPLIANCE_OFFICER', 'EXAM_ADMIN']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['EXAM_ADMIN']
  }
];
