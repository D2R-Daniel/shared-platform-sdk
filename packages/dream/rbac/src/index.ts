// Permission matching
export { matchesPermission, hasAnyPermission, hasAllPermissions } from './permissions';

// Role hierarchy
export { BUILT_IN_ROLES, requireMinimumRole, getRoleBySlug } from './hierarchy';

// Custom roles
export { defineCustomRoles, resetCustomRoles } from './custom-roles';
export type { CustomRoleDefinition } from './custom-roles';

// Constants
export { PERMISSIONS } from './constants';

// Middleware
export {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireMinimumRoleMiddleware,
  AuthorizationError,
} from './middleware';

// React (re-exported for convenience)
export {
  RbacContext,
  RbacTestProvider,
  useRbacContext,
  usePermission,
  useRole,
  useHasMinimumRole,
  PermissionGate,
  RoleGate,
  AdminGate,
} from './react/index';

export type { RbacContextValue } from './react/context';
export type { PermissionGateProps } from './react/permission-gate';
export type { RoleGateProps } from './react/role-gate';
export type { AdminGateProps } from './react/admin-gate';
