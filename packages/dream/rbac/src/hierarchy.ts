import type { BuiltInRole, RoleDefinition } from '@dream/types';
import { getCustomRole } from './custom-roles';

/**
 * Built-in role definitions with hierarchy levels.
 * Lower hierarchyLevel = higher privilege.
 */
export const BUILT_IN_ROLES: Record<BuiltInRole, RoleDefinition> = {
  super_admin: {
    slug: 'super_admin',
    name: 'Super Admin',
    hierarchyLevel: 0,
    permissions: ['*'],
  },
  admin: {
    slug: 'admin',
    name: 'Admin',
    hierarchyLevel: 10,
    permissions: [
      'users:*',
      'roles:*',
      'teams:*',
      'departments:*',
      'invitations:*',
      'settings:*',
      'audit:read',
    ],
  },
  manager: {
    slug: 'manager',
    name: 'Manager',
    hierarchyLevel: 20,
    permissions: [
      'users:read',
      'teams:*',
      'departments:read',
      'invitations:create',
      'invitations:read',
    ],
  },
  user: {
    slug: 'user',
    name: 'User',
    hierarchyLevel: 30,
    permissions: ['users:read:self', 'teams:read', 'departments:read'],
  },
  guest: {
    slug: 'guest',
    name: 'Guest',
    hierarchyLevel: 40,
    permissions: ['users:read:self'],
  },
};

/**
 * Checks if a user's hierarchy level meets or exceeds the required level.
 * Lower number = more privileged. Returns true if userLevel <= requiredLevel.
 */
export function requireMinimumRole(
  userLevel: number,
  requiredLevel: number,
): boolean {
  return userLevel <= requiredLevel;
}

/**
 * Looks up a role definition by its slug.
 * Searches built-in roles first, then any registered custom roles.
 */
export function getRoleBySlug(slug: string): RoleDefinition | undefined {
  const builtIn = (BUILT_IN_ROLES as Record<string, RoleDefinition>)[slug];
  if (builtIn) {
    return builtIn;
  }
  return getCustomRole(slug);
}
