// @dream/auth — Public API Contract
// Version: 0.1.0
// Purpose: Shared authentication for Next.js products using NextAuth v5

import type { NextAuthConfig } from 'next-auth';
import type { NextRequest, NextResponse } from 'next/server';

// === Configuration ===

export interface AuthConfig {
  providers: AuthProvider[];
  azure?: AzureEntraConfig;
  google?: GoogleOAuthConfig;
  sessionMaxAge?: number; // seconds, default: 28800 (8 hours)
  lockout?: LockoutConfig;
  publicRoutes?: string[]; // routes that skip auth
  callbacks?: AuthCallbacks;
}

export interface LockoutConfig {
  maxAttempts: number; // default: 5
  durationMinutes: number; // default: 15
}

export interface AuthCallbacks {
  enrichJwt?: (token: JWT, user: User, account: Account) => Promise<JWT>;
  onSignIn?: (user: User, account: Account) => Promise<boolean>;
  onSignOut?: (session: Session) => Promise<void>;
}

type AuthProvider = 'credentials' | 'azure-entra' | 'google' | 'generic-oidc';

// === Factory Functions ===

export function createAuthConfig(config: AuthConfig): NextAuthConfig;
export function createAuthMiddleware(config: AuthConfig): (req: NextRequest) => NextResponse | Promise<NextResponse>;

// === Account Lockout ===

export function checkAccountLockout(userId: string): Promise<{ locked: boolean; lockedUntil?: Date }>;
export function recordFailedLogin(userId: string): Promise<{ locked: boolean; attemptsRemaining: number }>;
export function resetFailedLogins(userId: string): Promise<void>;

// === React Context ===

export function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
export function useAuth(): AuthContext;

export interface AuthContext {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (provider: string, options?: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
}
