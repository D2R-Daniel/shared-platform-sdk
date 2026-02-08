import { createContext } from 'react';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
  activeRole: string;
  permissions: string[];
}

export interface SignInOptions {
  callbackUrl?: string;
  redirect?: boolean;
}

export interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (provider: string, options?: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
