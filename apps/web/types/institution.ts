export interface InstitutionEntity {
  institutionId: string;
  code: string;
  name: string;
  domain: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettingEntity {
  settingId: string;
  institutionId: string;
  key: string;
  value: unknown;
  category: 'SECURITY' | 'EXAM' | 'NOTIFICATIONS' | 'GENERAL';
  updatedAt: string;
}
