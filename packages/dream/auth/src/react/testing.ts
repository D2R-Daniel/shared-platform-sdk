import React, { useMemo } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue, SessionUser, SignInOptions } from './auth-context';

export interface MockAuthProviderProps {
  children: React.ReactNode;
  user: SessionUser | null;
  isLoading?: boolean;
  onSignIn?: (provider: string, options?: SignInOptions) => Promise<void>;
  onSignOut?: () => Promise<void>;
  onSwitchOrganization?: (organizationId: string) => Promise<void>;
}

export function MockAuthProvider({
  children,
  user,
  isLoading = false,
  onSignIn,
  onSignOut,
  onSwitchOrganization,
}: MockAuthProviderProps): React.JSX.Element {
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signIn: onSignIn ?? (async () => {}),
      signOut: onSignOut ?? (async () => {}),
      switchOrganization: onSwitchOrganization ?? (async () => {}),
    }),
    [user, isLoading, onSignIn, onSignOut, onSwitchOrganization],
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}
