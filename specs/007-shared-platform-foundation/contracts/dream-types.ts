// @dream/types — Public API Contract
// Version: 0.1.0
// Purpose: Shared TypeScript type definitions for all 5 SaaS products

// === Barrel Export (import from '@dream/types') ===

// Core entity types
export type { User, UserStatus, UserCreateInput, UserUpdateInput } from './users';
export type { Organization, OrganizationStatus, OrgCreateInput, OrgUpdateInput } from './organizations';
export type { OrganizationMembership } from './memberships';
export type { Role, RoleSlug, BuiltInRole, CustomRole, RoleCreateInput } from './roles';
export type { Permission, PermissionString } from './permissions';
export type { Team, TeamMember, TeamCreateInput } from './teams';
export type { Department, DepartmentCreateInput } from './departments';
export type { Session, SessionUser, JWTPayload } from './sessions';
export type { AuditEvent, AuditEventType, AuditQueryParams } from './audit';
export type { Invitation, InvitationType, InvitationStatus } from './invitations';
export type { SSOAccount, SSOProvider } from './sso';

// Response types
export type { ApiResponse, ApiErrorResponse, PaginatedResponse, CursorPaginatedResponse } from './responses';

// Zod schemas (runtime validation)
export { userSchema, organizationSchema, roleSchema, teamSchema, invitationSchema, auditEventSchema } from './schemas';

// === Sub-path Exports ===

// import { usersTable, organizationsTable, ... } from '@dream/types/drizzle'
// import { UserModel, OrganizationModel, ... } from '@dream/types/prisma'
// import { userSchema, organizationSchema, ... } from '@dream/types/schemas'
// import type { User, Session } from '@dream/types/auth'
// import type { Team, Department } from '@dream/types/teams'

// === Key Types ===

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

type UserStatus = 'active' | 'suspended' | 'deleted';

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  planTier: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP';
  region: 'us-east' | 'eu-west' | 'in-mumbai' | 'ap-singapore';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

type OrganizationStatus = 'active' | 'suspended' | 'archived';

interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  hierarchyLevel: number; // 0 = highest privilege
  isBuiltIn: boolean;
  isActive: boolean;
  organizationId: string | null; // null for built-in
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

type BuiltInRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'guest';

interface Session {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: OrganizationStatus;
}

interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  ipAddress: string;
  requestId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface ApiResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    userMessage: string;
    requestId: string;
    param?: string;
  };
}

interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface CursorPaginatedResponse<T> {
  success: true;
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
}
