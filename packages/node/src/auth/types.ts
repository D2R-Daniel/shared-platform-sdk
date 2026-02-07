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
  acr?: string;
  amr?: string[];
  exp?: number;
  iat?: number;
}

/**
 * Supported social/external identity providers.
 */
export type SocialProvider =
  | 'google'
  | 'github'
  | 'microsoft'
  | 'apple'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'okta'
  | 'auth0'
  | 'saml';

/**
 * Authenticator Assurance Levels per NIST 800-63B.
 */
export enum AssuranceLevel {
  /** Single-factor authentication (password only) */
  AAL1 = 'aal1',
  /** Multi-factor authentication (password + second factor) */
  AAL2 = 'aal2',
  /** Hardware-based MFA (FIDO2, smart card) */
  AAL3 = 'aal3',
}

/**
 * PKCE code challenge pair used in authorization code flow.
 */
export interface PKCEChallenge {
  /** Random code verifier string (43-128 chars) */
  codeVerifier: string;
  /** Base64url-encoded SHA-256 hash of the code verifier */
  codeChallenge: string;
  /** Always 'S256' */
  codeChallengeMethod: 'S256';
}

/**
 * Options for building an authorization URL.
 */
export interface AuthorizationUrlOptions {
  /** OAuth2 redirect URI */
  redirectUri: string;
  /** Space-separated scopes to request */
  scope?: string;
  /** Opaque state value for CSRF protection */
  state?: string;
  /** Hint to the authorization server about the login identifier */
  loginHint?: string;
  /** Social/external provider to use */
  provider?: SocialProvider;
  /** Requested assurance level for step-up auth */
  acrValues?: AssuranceLevel;
  /** Additional query parameters to include */
  additionalParams?: Record<string, string>;
}

/**
 * Result from buildAuthorizationUrl, includes the PKCE verifier to store.
 */
export interface AuthorizationUrlResult {
  /** Full authorization URL to redirect the user to */
  url: string;
  /** PKCE challenge pair (store codeVerifier for the token exchange) */
  pkce: PKCEChallenge;
  /** State value (echoed back if provided, generated if not) */
  state: string;
}

/**
 * Options for requesting client credentials (M2M) tokens.
 */
export interface ClientCredentialsOptions {
  /** Space-separated scopes to request */
  scope?: string;
  /** Target audience for the token */
  audience?: string;
}

/**
 * Options for local JWT validation.
 */
export interface TokenValidationOptions {
  /** Expected audience claim */
  audience?: string;
  /** Expected issuer claim */
  issuer?: string;
  /** Clock skew tolerance in seconds (default: 30) */
  clockToleranceSeconds?: number;
  /** Required scopes the token must contain */
  requiredScopes?: string[];
  /** Required minimum assurance level */
  requiredAssuranceLevel?: AssuranceLevel;
}

/**
 * Result of local JWT validation.
 */
export interface TokenValidationResult {
  /** Whether the token is valid */
  valid: boolean;
  /** Decoded JWT payload (present when valid) */
  payload?: JWTPayload & {
    acr?: string;
    amr?: string[];
    aud?: string | string[];
    iss?: string;
    exp?: number;
    iat?: number;
    nbf?: number;
    jti?: string;
  };
  /** Error message (present when invalid) */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: 'expired' | 'invalid_signature' | 'invalid_audience' | 'invalid_issuer' | 'insufficient_scope' | 'insufficient_assurance' | 'malformed';
}

/**
 * JSON Web Key from a JWKS endpoint.
 */
export interface JSONWebKey {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  x5c?: string[];
  x5t?: string;
}

/**
 * JSON Web Key Set response.
 */
export interface JSONWebKeySet {
  keys: JSONWebKey[];
}

/**
 * OIDC Discovery Document (.well-known/openid-configuration).
 */
export interface OIDCDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  revocation_endpoint?: string;
  introspection_endpoint?: string;
  end_session_endpoint?: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported: string[];
  response_modes_supported?: string[];
  grant_types_supported?: string[];
  acr_values_supported?: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  claims_supported?: string[];
  code_challenge_methods_supported?: string[];
}

/**
 * Request to initiate step-up authentication.
 */
export interface StepUpRequest {
  /** Target assurance level */
  targetLevel: AssuranceLevel;
  /** Reason displayed to the user */
  reason?: string;
  /** URL to redirect to after step-up completion */
  redirectUri?: string;
}

/**
 * Result of a step-up authentication check or initiation.
 */
export interface StepUpResult {
  /** Whether step-up is required */
  required: boolean;
  /** Current assurance level */
  currentLevel: AssuranceLevel;
  /** Required assurance level */
  targetLevel: AssuranceLevel;
  /** URL to redirect user for step-up (present when required=true) */
  stepUpUrl?: string;
  /** New access token (present when step-up already satisfied) */
  accessToken?: string;
}

/**
 * Options for the auto-refresh behavior.
 */
export interface AutoRefreshOptions {
  /** Current refresh token */
  refreshToken: string;
  /** Seconds before expiry to trigger refresh (default: 60) */
  refreshBeforeExpirySeconds?: number;
  /** Maximum number of consecutive refresh failures before stopping (default: 3) */
  maxRetries?: number;
  /** Callback invoked on each successful refresh */
  onRefresh?: (tokens: TokenResponse) => void;
  /** Callback invoked when auto-refresh fails permanently */
  onError?: (error: Error) => void;
}

/**
 * Handle returned by enableAutoRefresh to control the refresh timer.
 */
export interface AutoRefreshHandle {
  /** Stop the auto-refresh timer */
  stop: () => void;
  /** Whether auto-refresh is currently active */
  isActive: () => boolean;
}
