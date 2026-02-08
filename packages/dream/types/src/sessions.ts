import type { OrganizationStatus } from './organizations';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: OrganizationStatus;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: OrganizationStatus;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
  activeRole: string;
  permissions: string[];
  planTier: string;
  tenantStatus: string;
  authProvider: string;
  iat: number;
  exp: number;
}
