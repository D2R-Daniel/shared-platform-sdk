export type AuthProvider = 'credentials' | 'azure-entra' | 'google' | 'generic-oidc';

export interface AzureEntraConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
}

export interface LockoutConfig {
  maxAttempts: number;
  durationMinutes: number;
}

export interface AuthCallbacks {
  enrichJwt?: (token: Record<string, unknown>, user: unknown, account: unknown) => Promise<Record<string, unknown>>;
  onSignIn?: (user: unknown, account: unknown) => Promise<boolean>;
  onSignOut?: (session: unknown) => Promise<void>;
}

export interface AuthConfig {
  providers: AuthProvider[];
  azure?: AzureEntraConfig;
  google?: GoogleOAuthConfig;
  sessionMaxAge?: number;
  lockout?: LockoutConfig;
  publicRoutes?: string[];
  callbacks?: AuthCallbacks;
}

export interface ResolvedAuthConfig {
  providers: AuthProvider[];
  azure?: AzureEntraConfig;
  google?: GoogleOAuthConfig;
  sessionMaxAge: number;
  sessionStrategy: 'jwt';
  lockout: LockoutConfig;
  publicRoutes: string[];
  callbacks?: AuthCallbacks;
}

const DEFAULT_SESSION_MAX_AGE = 28800; // 8 hours in seconds

const DEFAULT_LOCKOUT: LockoutConfig = {
  maxAttempts: 5,
  durationMinutes: 15,
};

export function createAuthConfig(config: AuthConfig): ResolvedAuthConfig {
  return {
    providers: config.providers,
    azure: config.azure,
    google: config.google,
    sessionMaxAge: config.sessionMaxAge ?? DEFAULT_SESSION_MAX_AGE,
    sessionStrategy: 'jwt',
    lockout: config.lockout ?? { ...DEFAULT_LOCKOUT },
    publicRoutes: config.publicRoutes ?? [],
    callbacks: config.callbacks,
  };
}
