import { InstitutionEntity } from '@/types/institution';
import { DepartmentEntity, CourseEntity, ProgramEntity, BatchEntity } from '@/types/user';

export const MOCK_INSTITUTIONS: InstitutionEntity[] = [
  {
    institutionId: 'inst_default',
    name: 'Sentinel Institute of Technology',
    code: 'SENTINEL-TECH',
    domain: 'sentinelai.io',
    contactEmail: 'admin@sentineltech.edu',
    contactPhone: '+1 (555) 019-2831',
    address: '100 Innovation Boulevard, Tech Park, CA 94025',
    logoUrl: 'https://assets.sentinelai.io/logos/sentinel_tech.png',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    institutionId: 'inst_apex',
    name: 'Apex Academy of Science',
    code: 'APEX-SCI',
    domain: 'apex.edu',
    contactEmail: 'contact@apex.edu',
    contactPhone: '+1 (555) 012-9988',
    address: '450 University Avenue, Cambridge, MA 02138',
    logoUrl: 'https://assets.sentinelai.io/logos/apex.png',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  }
];

export const MOCK_DEPARTMENTS: DepartmentEntity[] = [
  {
    departmentId: 'dept_cs',
    institutionId: 'inst_default',
    name: 'Department of Computer Science',
    code: 'CS',
    headName: 'Dr. Evelyn Reed'
  },
  {
    departmentId: 'dept_ee',
    institutionId: 'inst_default',
    name: 'Department of Electrical Engineering',
    code: 'EE',
    headName: 'Prof. Marcus Vance'
  }
];

export const MOCK_COURSES: CourseEntity[] = [
  {
    courseId: 'crs_401',
    departmentId: 'dept_cs',
    institutionId: 'inst_default',
    title: 'Advanced Data Structures & Algorithms',
    code: 'CS401',
    credits: 4
  },
  {
    courseId: 'crs_301',
    departmentId: 'dept_cs',
    institutionId: 'inst_default',
    title: 'Operating System Design & Kernel Internals',
    code: 'CS301',
    credits: 4
  }
];

export const MOCK_PROGRAMS: ProgramEntity[] = [
  {
    programId: 'prog_btech_cs',
    institutionId: 'inst_default',
    name: 'Bachelor of Technology in Computer Science',
    code: 'BTECH-CS',
    degreeType: 'BACHELORS'
  }
];

export const MOCK_BATCHES: BatchEntity[] = [
  {
    batchId: 'batch_2026_cs',
    institutionId: 'inst_default',
    name: 'Class of 2026 CS-A',
    code: 'CS-2026-A',
    startYear: 2022,
    endYear: 2026
  }
];
