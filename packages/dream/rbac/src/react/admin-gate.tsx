'use client';

import type { ReactNode } from 'react';
import { useRole } from './hooks';

export interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user's hierarchy level is <= 10
 * (i.e., admin or super_admin).
 */
export function AdminGate({
  children,
  fallback = null,
}: AdminGateProps): ReactNode {
  const { hierarchyLevel } = useRole();

  // hierarchyLevel -1 means unauthenticated (outside provider)
  if (hierarchyLevel < 0 || hierarchyLevel > 10) {
    return fallback;
  }

  return children;
}
