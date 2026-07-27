import { SensitivityProfile } from '@sentinel-ai/types';

export type InstitutionType = 'UNIVERSITY' | 'COLLEGE' | 'HIGH_SCHOOL' | 'CERTIFICATION_BODY';
export type InstitutionStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface InstitutionEntity {
  institutionId: string;
  slug: string;
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  contactEmail: string;
  phoneNumber: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentEntity {
  departmentId: string;
  institutionId: string;
  code: string;
  name: string;
  headOfDepartment: string | null;
  createdAt: string;
}

export interface CourseEntity {
  courseId: string;
  institutionId: string;
  departmentId: string;
  code: string;
  title: string;
  description: string | null;
  credits: number;
  createdAt: string;
}

export interface FacultyEntity {
  facultyId: string;
  institutionId: string;
  departmentId: string;
  userId: string;
  title: string;
  email: string;
  assignedCourses: string[];
  joinedAt: string;
}

export interface AcademicProgramEntity {
  programId: string;
  institutionId: string;
  code: string;
  title: string;
  degreeLevel: 'BACHELORS' | 'MASTERS' | 'PHD' | 'DIPLOMA' | 'CERTIFICATE';
  totalCreditsRequired: number;
  durationYears: number;
}

export interface BatchEntity {
  batchId: string;
  institutionId: string;
  programId: string;
  year: number;
  name: string;
  maxCapacity: number;
}

export interface SemesterEntity {
  semesterId: string;
  institutionId: string;
  batchId: string;
  termName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicCalendarEntity {
  calendarId: string;
  institutionId: string;
  title: string;
  eventDate: string;
  eventType: 'EXAM_WINDOW' | 'HOLIDAY' | 'TERM_START' | 'TERM_END' | 'REGISTRATION';
  description: string | null;
}

export interface InstitutionBrandingEntity {
  brandingId: string;
  institutionId: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  portalDomain: string | null;
  customCssUrl: string | null;
  updatedAt: string;
}

export interface InstitutionConfigurationEntity {
  configId: string;
  institutionId: string;
  sensitivityProfile: SensitivityProfile;
  allowMobileExams: boolean;
  autoTerminateOnCriticalAlert: boolean;
  allowedIpRanges: string[];
  ssoEnabled: boolean;
  ssoProviderUrl: string | null;
  updatedAt: string;
}

// Request & Response DTOs
export interface CreateInstitutionDto {
  slug: string;
  name: string;
  type: InstitutionType;
  contactEmail: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateInstitutionDto {
  name?: string;
  contactEmail?: string;
  phoneNumber?: string;
  address?: string;
  status?: InstitutionStatus;
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  headOfDepartment?: string;
}

export interface CreateCourseDto {
  departmentId: string;
  code: string;
  title: string;
  description?: string;
  credits: number;
}

export interface AssignFacultyDto {
  departmentId: string;
  userId: string;
  title: string;
  email: string;
  assignedCourses?: string[];
}

export interface CreateProgramDto {
  code: string;
  title: string;
  degreeLevel: 'BACHELORS' | 'MASTERS' | 'PHD' | 'DIPLOMA' | 'CERTIFICATE';
  totalCreditsRequired: number;
  durationYears: number;
}

export interface CreateBatchDto {
  programId: string;
  year: number;
  name: string;
  maxCapacity: number;
}

export interface CreateSemesterDto {
  batchId: string;
  termName: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface CreateCalendarEventDto {
  title: string;
  eventDate: string;
  eventType: 'EXAM_WINDOW' | 'HOLIDAY' | 'TERM_START' | 'TERM_END' | 'REGISTRATION';
  description?: string;
}

export interface UpdateBrandingDto {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  portalDomain?: string;
  customCssUrl?: string;
}

export interface UpdateConfigurationDto {
  sensitivityProfile?: SensitivityProfile;
  allowMobileExams?: boolean;
  autoTerminateOnCriticalAlert?: boolean;
  allowedIpRanges?: string[];
  ssoEnabled?: boolean;
  ssoProviderUrl?: string;
}

export interface InstitutionSearchQueryDto {
  query?: string;
  type?: InstitutionType;
  status?: InstitutionStatus;
  page?: number;
  limit?: number;
}

export interface InstitutionDetailResponseDto {
  institution: InstitutionEntity;
  branding?: InstitutionBrandingEntity;
  configuration?: InstitutionConfigurationEntity;
  departments?: DepartmentEntity[];
  programs?: AcademicProgramEntity[];
  activeEvents?: AcademicCalendarEntity[];
}
