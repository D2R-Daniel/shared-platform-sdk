export type BuiltInRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'guest';

export type RoleSlug = BuiltInRole | string;

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  hierarchyLevel: number;
  isBuiltIn: boolean;
  isActive: boolean;
  organizationId: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomRole {
  slug: string;
  name: string;
  hierarchyLevel: number;
  permissions: string[];
  organizationId?: string;
}

export interface RoleDefinition {
  slug: string;
  name: string;
  hierarchyLevel: number;
  permissions: string[];
}

export interface RoleCreateInput {
  name: string;
  slug: string;
  description?: string;
  hierarchyLevel: number;
  permissions: string[];
  organizationId?: string;
}
