'use client';

import type { ReactNode } from 'react';
import { useRole } from './hooks';

export interface RoleGateProps {
  role: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user's active role matches exactly.
 * This is NOT hierarchy-based — use AdminGate for hierarchy checks.
 */
export function RoleGate({
  role,
  children,
  fallback = null,
}: RoleGateProps): ReactNode {
  const { role: activeRole } = useRole();

  if (activeRole !== role) {
    return fallback;
  }

  return children;
}
