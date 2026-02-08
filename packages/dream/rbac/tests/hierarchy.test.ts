import { describe, it, expect } from 'vitest';
import { BUILT_IN_ROLES, requireMinimumRole, getRoleBySlug } from '../src/hierarchy';
import { PERMISSIONS } from '../src/constants';

describe('BUILT_IN_ROLES', () => {
  it('should have exactly 5 entries', () => {
    expect(Object.keys(BUILT_IN_ROLES)).toHaveLength(5);
  });

  it('should contain super_admin, admin, manager, user, guest', () => {
    expect(BUILT_IN_ROLES).toHaveProperty('super_admin');
    expect(BUILT_IN_ROLES).toHaveProperty('admin');
    expect(BUILT_IN_ROLES).toHaveProperty('manager');
    expect(BUILT_IN_ROLES).toHaveProperty('user');
    expect(BUILT_IN_ROLES).toHaveProperty('guest');
  });

  it('should have correct hierarchy levels', () => {
    expect(BUILT_IN_ROLES.super_admin.hierarchyLevel).toBe(0);
    expect(BUILT_IN_ROLES.admin.hierarchyLevel).toBe(10);
    expect(BUILT_IN_ROLES.manager.hierarchyLevel).toBe(20);
    expect(BUILT_IN_ROLES.user.hierarchyLevel).toBe(30);
    expect(BUILT_IN_ROLES.guest.hierarchyLevel).toBe(40);
  });

  it('should give super_admin the global wildcard permission', () => {
    expect(BUILT_IN_ROLES.super_admin.permissions).toEqual(['*']);
  });

  it('should have slug matching the key for each role', () => {
    for (const [key, role] of Object.entries(BUILT_IN_ROLES)) {
      expect(role.slug).toBe(key);
    }
  });

  it('should have a name for each role', () => {
    for (const role of Object.values(BUILT_IN_ROLES)) {
      expect(role.name).toBeTruthy();
      expect(typeof role.name).toBe('string');
    }
  });
});

describe('requireMinimumRole', () => {
  it('should return true when user level equals required level', () => {
    expect(requireMinimumRole(10, 10)).toBe(true);
  });

  it('should return true when user level is more privileged (lower number)', () => {
    expect(requireMinimumRole(0, 10)).toBe(true);
  });

  it('should return false when user level is less privileged (higher number)', () => {
    expect(requireMinimumRole(30, 10)).toBe(false);
  });

  it('should return true for super_admin against any requirement', () => {
    expect(requireMinimumRole(0, 40)).toBe(true);
  });

  it('should return false for guest against admin requirement', () => {
    expect(requireMinimumRole(40, 10)).toBe(false);
  });
});

describe('getRoleBySlug', () => {
  it('should return role definition for valid built-in slug', () => {
    const role = getRoleBySlug('admin');
    expect(role).toBeDefined();
    expect(role!.slug).toBe('admin');
    expect(role!.hierarchyLevel).toBe(10);
  });

  it('should return undefined for unknown slug', () => {
    expect(getRoleBySlug('nonexistent')).toBeUndefined();
  });
});

describe('PERMISSIONS constant', () => {
  it('should have GLOBAL wildcard', () => {
    expect(PERMISSIONS.GLOBAL).toBe('*');
  });

  it('should have USERS permissions', () => {
    expect(PERMISSIONS.USERS.READ).toBe('users:read');
    expect(PERMISSIONS.USERS.WRITE).toBe('users:write');
    expect(PERMISSIONS.USERS.DELETE).toBe('users:delete');
    expect(PERMISSIONS.USERS.WILDCARD).toBe('users:*');
  });

  it('should have TEAMS permissions', () => {
    expect(PERMISSIONS.TEAMS.READ).toBe('teams:read');
    expect(PERMISSIONS.TEAMS.WRITE).toBe('teams:write');
    expect(PERMISSIONS.TEAMS.MANAGE).toBe('teams:manage');
    expect(PERMISSIONS.TEAMS.WILDCARD).toBe('teams:*');
  });

  it('should have ROLES permissions', () => {
    expect(PERMISSIONS.ROLES.READ).toBe('roles:read');
    expect(PERMISSIONS.ROLES.WRITE).toBe('roles:write');
    expect(PERMISSIONS.ROLES.ASSIGN).toBe('roles:assign');
    expect(PERMISSIONS.ROLES.WILDCARD).toBe('roles:*');
  });

  it('should have SETTINGS permissions', () => {
    expect(PERMISSIONS.SETTINGS.READ).toBe('settings:read');
    expect(PERMISSIONS.SETTINGS.WRITE).toBe('settings:write');
    expect(PERMISSIONS.SETTINGS.WILDCARD).toBe('settings:*');
  });

  it('should have AUDIT permissions', () => {
    expect(PERMISSIONS.AUDIT.READ).toBe('audit:read');
    expect(PERMISSIONS.AUDIT.EXPORT).toBe('audit:export');
    expect(PERMISSIONS.AUDIT.WILDCARD).toBe('audit:*');
  });
});
