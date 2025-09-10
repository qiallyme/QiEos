// Minimal starter types. Add more as you go.
export type OrgId = string;
export type CompanyId = string;
export type Role = 'admin' | 'internal' | 'external' | 'public';

export interface Claims {
  role: Role;
  org_id: OrgId;
  company_ids?: CompanyId[];
  department?: 'public' | 'external' | 'internal';
  features?: Record<string, boolean>;
}
