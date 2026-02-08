'use client';

import React, { useMemo } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue } from './auth-context';

export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider wraps the application with authentication context.
 * In production, this integrates with NextAuth's SessionProvider.
 * For testing, use MockAuthProvider instead.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      signIn: async () => {
        throw new Error('AuthProvider: signIn not implemented. Use NextAuth signIn().');
      },
      signOut: async () => {
        throw new Error('AuthProvider: signOut not implemented. Use NextAuth signOut().');
      },
      switchOrganization: async () => {
        throw new Error('AuthProvider: switchOrganization not implemented.');
      },
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
