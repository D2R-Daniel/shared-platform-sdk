// @dream/rbac — Public API Contract
// Version: 0.1.0
// Purpose: Role-based access control with resource:action permissions

// === Permission Matching ===

export function matchesPermission(userPermission: string, requiredPermission: string): boolean;
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean;
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean;

// === Role Hierarchy ===

export const BUILT_IN_ROLES: Record<BuiltInRole, RoleDefinition>;
export function requireMinimumRole(userLevel: number, requiredLevel: number): boolean;
export function defineCustomRoles(roles: CustomRoleDefinition[]): RoleDefinition[];

export interface RoleDefinition {
  slug: string;
  name: string;
  hierarchyLevel: number;
  permissions: string[];
}

export interface CustomRoleDefinition {
  slug: string;
  name: string;
  hierarchyLevel: number; // 0-100
  permissions: string[];
  organizationId?: string; // null for global custom roles
}

// === Permission Constants (typed, with autocomplete) ===

export const PERMISSIONS: {
  USERS: { READ: 'users:read'; WRITE: 'users:write'; DELETE: 'users:delete'; WILDCARD: 'users:*' };
  TEAMS: { READ: 'teams:read'; WRITE: 'teams:write'; MANAGE: 'teams:manage'; WILDCARD: 'teams:*' };
  ROLES: { READ: 'roles:read'; WRITE: 'roles:write'; ASSIGN: 'roles:assign'; WILDCARD: 'roles:*' };
  INVOICES: { READ: 'invoices:read'; WRITE: 'invoices:write'; DELETE: 'invoices:delete'; WILDCARD: 'invoices:*' };
  REPORTS: { READ: 'reports:read'; EXPORT: 'reports:export'; WILDCARD: 'reports:*' };
  SETTINGS: { READ: 'settings:read'; WRITE: 'settings:write'; WILDCARD: 'settings:*' };
  AUDIT: { READ: 'audit:read'; EXPORT: 'audit:export'; WILDCARD: 'audit:*' };
  GLOBAL: '*';
};

// === Middleware HOFs ===

export function requirePermission(permission: string): MiddlewareHOF;
export function requireAnyPermission(...permissions: string[]): MiddlewareHOF;
export function requireAllPermissions(...permissions: string[]): MiddlewareHOF;
export function requireRole(role: string): MiddlewareHOF;
export function requireMinimumRoleMiddleware(level: number): MiddlewareHOF;

type MiddlewareHOF = (handler: ApiHandler) => ApiHandler;

// === React Components ===

export function PermissionGate(props: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): JSX.Element;

export function RoleGate(props: {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): JSX.Element;

export function AdminGate(props: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): JSX.Element;

// === React Hooks ===

export function usePermission(permission: string): boolean;
export function useRole(): { role: string; roles: string[]; hierarchyLevel: number };
export function useHasMinimumRole(minimumRole: string): boolean;
