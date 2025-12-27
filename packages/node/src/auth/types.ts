/**
 * Authentication type definitions
 */

export interface TokenResponse {
  /** JWT access token */
  accessToken: string;
  /** Token type (always "Bearer") */
  tokenType: string;
  /** Token lifetime in seconds */
  expiresIn: number;
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** Granted scopes (space-separated) */
  scope?: string;
  /** OIDC ID token */
  idToken?: string;
}

export interface TokenIntrospection {
  /** Whether the token is valid and active */
  active: boolean;
  /** Scopes associated with the token */
  scope?: string;
  /** Client that requested the token */
  clientId?: string;
  /** Username of the token owner */
  username?: string;
  /** Type of token */
  tokenType?: string;
  /** Token expiration timestamp (Unix epoch) */
  exp?: number;
  /** Token issuance timestamp (Unix epoch) */
  iat?: number;
  /** Subject (user ID) */
  sub?: string;
  /** Audience */
  aud?: string;
  /** Issuer */
  iss?: string;
  /** Unique token identifier */
  jti?: string;
}

export interface UserInfo {
  /** User ID */
  sub: string;
  /** Email address */
  email?: string;
  /** Whether email is verified */
  emailVerified?: boolean;
  /** Full name */
  name?: string;
  /** First name */
  givenName?: string;
  /** Last name */
  familyName?: string;
  /** Profile picture URL */
  picture?: string;
  /** User's roles */
  roles?: string[];
  /** User's permissions */
  permissions?: string[];
  /** Tenant/organization ID */
  tenantId?: string;
}

export interface UserContext {
  /** User ID */
  userId: string;
  /** Email address */
  email?: string;
  /** Whether email is verified */
  emailVerified: boolean;
  /** Full name */
  name?: string;
  /** First name */
  givenName?: string;
  /** Last name */
  familyName?: string;
  /** Profile picture URL */
  picture?: string;
  /** Assigned roles */
  roles: string[];
  /** Computed permissions */
  permissions: string[];
  /** Tenant/organization ID */
  tenantId?: string;
  /** Team/department ID */
  teamId?: string;
  /** Session ID */
  sessionId?: string;
  /** OAuth scopes */
  scopes: string[];
  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Check if user has a specific permission */
  hasPermission(permission: string): boolean;
  /** Check if user has any of the specified permissions */
  hasAnyPermission(permissions: string[]): boolean;
  /** Check if user has all of the specified permissions */
  hasAllPermissions(permissions: string[]): boolean;
  /** Check if user has a specific role */
  hasRole(role: string): boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole(roles: string[]): boolean;
  /** Check if user is an admin or super_admin */
  isAdmin(): boolean;
  /** Check if user is a super_admin */
  isSuperAdmin(): boolean;
}

export interface Session {
  /** Session ID */
  id: string;
  /** Browser/client user agent */
  userAgent?: string;
  /** Client IP address */
  ipAddress?: string;
  /** Approximate location */
  location?: string;
  /** Session creation time */
  createdAt: string;
  /** Last activity time */
  lastActiveAt: string;
  /** Whether this is the current session */
  isCurrent?: boolean;
}

export interface JWTPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  roles?: string[];
  permissions?: string[];
  tenant_id?: string;
  team_id?: string;
  session_id?: string;
  scope?: string;
  exp?: number;
  iat?: number;
}
