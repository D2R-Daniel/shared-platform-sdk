/**
 * Authentication module
 */

export { AuthClient } from './client';
export type { AuthClientOptions } from './client';

export type {
  TokenResponse,
  TokenIntrospection,
  UserInfo,
  UserContext,
  Session,
} from './types';

export { ROLES, PERMISSIONS, getRolePermissions, checkPermission } from './roles';
export type { Role, Permission } from './roles';

export {
  AuthError,
  TokenExpiredError,
  InvalidTokenError,
  UnauthorizedError,
  ForbiddenError,
} from './errors';
