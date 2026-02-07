/**
 * Permissions module for role-based access control.
 */

export {
  RoleClient,
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './client';
export type { RoleClientConfig } from './client';

export type {
  Role,
  RoleSummary,
  RoleAssignment,
  UserRole,
  Permission,
  PermissionCheckResult,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  PermissionCheckRequest,
  RoleListResponse,
  UserRolesResponse,
  ListRolesParams,
  Pagination,
} from './types';

export {
  RoleError,
  RoleNotFoundError,
  RoleSlugExistsError,
  SystemRoleError,
  RoleInUseError,
  PermissionDeniedError,
  InvalidPermissionFormatError,
} from './errors';
