'use client';

import { createContext, useContext, createElement } from 'react';
import type { ReactNode } from 'react';

export interface RbacContextValue {
  permissions: string[];
  activeRole: string;
  roles: string[];
  roleLevel: number;
}

const defaultValue: RbacContextValue = {
  permissions: [],
  activeRole: '',
  roles: [],
  roleLevel: -1,
};

export const RbacContext = createContext<RbacContextValue | null>(null);

/**
 * Hook to access the RBAC context. Returns safe defaults when
 * used outside a provider (unauthenticated state).
 */
export function useRbacContext(): RbacContextValue {
  const ctx = useContext(RbacContext);
  return ctx ?? defaultValue;
}

/**
 * Test provider for RBAC context. Used in unit tests to simulate
 * authenticated users with specific permissions and roles.
 *
 * In production, the real AuthProvider from @dream/auth populates this context.
 */
export function RbacTestProvider(props: {
  permissions: string[];
  activeRole: string;
  roleLevel: number;
  roles?: string[];
  children: ReactNode;
}) {
  const value: RbacContextValue = {
    permissions: props.permissions,
    activeRole: props.activeRole,
    roles: props.roles ?? [props.activeRole],
    roleLevel: props.roleLevel,
  };

  return createElement(RbacContext.Provider, { value }, props.children);
}
