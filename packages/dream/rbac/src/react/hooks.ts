'use client';

import { useMemo } from 'react';
import { useRbacContext } from './context';
import { matchesPermission } from '../permissions';
import { BUILT_IN_ROLES, requireMinimumRole } from '../hierarchy';
import type { RoleDefinition } from '@dream/types';

/**
 * Returns whether the current user has the specified permission.
 * Returns false when outside a provider (unauthenticated).
 */
export function usePermission(permission: string): boolean {
  const { permissions } = useRbacContext();

  return useMemo(
    () => permissions.some((p) => matchesPermission(p, permission)),
    [permissions, permission],
  );
}

/**
 * Returns the current user's role information.
 * Returns safe defaults when outside a provider.
 */
export function useRole(): {
  role: string;
  roles: string[];
  hierarchyLevel: number;
} {
  const { activeRole, roles, roleLevel } = useRbacContext();

  return useMemo(
    () => ({
      role: activeRole,
      roles,
      hierarchyLevel: roleLevel,
    }),
    [activeRole, roles, roleLevel],
  );
}

/**
 * Returns whether the current user meets the minimum role requirement.
 * Looks up the minimum role's hierarchy level from BUILT_IN_ROLES.
 * Returns false when outside a provider.
 */
export function useHasMinimumRole(minimumRole: string): boolean {
  const { roleLevel } = useRbacContext();

  return useMemo(() => {
    // If outside provider, roleLevel is -1 (sentinel for unauthenticated)
    if (roleLevel < 0) {
      return false;
    }

    const roleDef = (BUILT_IN_ROLES as Record<string, RoleDefinition>)[minimumRole];
    if (!roleDef) {
      return false;
    }

    return requireMinimumRole(roleLevel, roleDef.hierarchyLevel);
  }, [roleLevel, minimumRole]);
}
