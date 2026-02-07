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
  JWTPayload,
  SocialProvider,
  PKCEChallenge,
  AuthorizationUrlOptions,
  AuthorizationUrlResult,
  ClientCredentialsOptions,
  TokenValidationOptions,
  TokenValidationResult,
  JSONWebKey,
  JSONWebKeySet,
  OIDCDiscoveryDocument,
  StepUpRequest,
  StepUpResult,
  AutoRefreshOptions,
  AutoRefreshHandle,
} from './types';

// Re-export AssuranceLevel as a value (enum)
export { AssuranceLevel } from './types';

export { ROLES, PERMISSIONS, getRolePermissions, checkPermission } from './roles';
export type { Role, Permission } from './roles';

export {
  generatePKCEChallenge,
  generateCodeVerifier,
  generateCodeChallenge,
} from './pkce';

export {
  AuthError,
  TokenExpiredError,
  InvalidTokenError,
  UnauthorizedError,
  ForbiddenError,
  StepUpRequiredError,
  DiscoveryError,
  JWKSError,
  TokenValidationError,
} from './errors';
