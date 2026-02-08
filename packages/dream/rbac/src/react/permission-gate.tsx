'use client';

import type { ReactNode } from 'react';
import { usePermission } from './hooks';

export interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has the required permission.
 * Renders fallback (default: null) otherwise.
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps): ReactNode {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return fallback;
  }

  return children;
}
