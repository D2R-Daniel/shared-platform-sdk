// @dream/auth — Barrel export
// Server-side: config, lockout, JWT enrichment

export { createAuthConfig } from './config';
export type {
  AuthConfig,
  ResolvedAuthConfig,
  AuthProvider as AuthProviderType,
  LockoutConfig,
  AuthCallbacks,
  AzureEntraConfig,
  GoogleOAuthConfig,
} from './config';

export { createLockoutManager } from './lockout';
export type {
  LockoutManager,
  LockoutCheckResult,
  FailedLoginResult,
} from './lockout';

export { enrichJwtToken } from './jwt';
export type { JwtEnrichmentContext } from './jwt';
